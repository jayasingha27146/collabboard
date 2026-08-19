const Comment = require("../models/Comment");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");
const { assertGroupMembership } = require("./groupService");
const notificationService = require("./notificationService");
const { emitToGroup } = require("./realtimeService");

const validStatuses = ["todo", "doing", "done"];
const validPriorities = ["high", "medium", "low"];

const allowedTransitions = {
  todo: ["doing"],
  doing: ["todo", "done"],
  done: ["doing"],
};

function buildTaskFilters(query) {
  const filters = {};

  if (query.status) {
    if (!validStatuses.includes(query.status)) {
      throw new ApiError("Invalid status filter", 400);
    }
    filters.status = query.status;
  }

  if (query.priority) {
    if (!validPriorities.includes(query.priority)) {
      throw new ApiError("Invalid priority filter", 400);
    }
    filters.priority = query.priority;
  }

  if (query.assignedTo) {
    filters.assignedTo = query.assignedTo;
  }

  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  return filters;
}

async function getGroupTasks(groupId, userId, query) {
  await assertGroupMembership(groupId, userId);

  const filters = {
    group: groupId,
    ...buildTaskFilters(query),
  };

  return Task.find(filters)
    .populate("assignedTo", "name email avatar role")
    .populate("createdBy", "name email avatar role")
    .sort({ createdAt: -1 });
}

async function createTask(groupId, userId, payload) {
  const group = await assertGroupMembership(groupId, userId);

  if (payload.priority && !validPriorities.includes(payload.priority)) {
    throw new ApiError("Invalid priority value", 400);
  }

  if (payload.status && !validStatuses.includes(payload.status)) {
    throw new ApiError("Invalid status value", 400);
  }

  const assigneeIsMember = group.members.some(
    (memberId) => String(memberId) === String(payload.assignedTo),
  );

  if (!assigneeIsMember) {
    throw new ApiError("Assigned user must be a member of this group", 400);
  }

  const task = await Task.create({
    title: payload.title,
    description: payload.description,
    group: groupId,
    assignedTo: payload.assignedTo,
    createdBy: userId,
    status: payload.status || "todo",
    priority: payload.priority || "medium",
    deadline: payload.deadline,
  });

  if (String(payload.assignedTo) !== String(userId)) {
    await notificationService.createNotification({
      recipient: payload.assignedTo,
      type: "TASK_ASSIGNED",
      message: "You have been assigned a new task.",
      relatedTask: task._id,
      relatedGroup: groupId,
    });
  }

  emitToGroup(String(groupId), "task:created", { taskId: task._id });

  return task;
}

async function getTaskById(taskId, userId) {
  const task = await Task.findById(taskId)
    .populate("assignedTo", "name email avatar role")
    .populate("createdBy", "name email avatar role")
    .populate("group", "name description owner members");

  if (!task) {
    throw new ApiError("Task not found", 404);
  }

  const isMember = task.group.members.some(
    (memberId) => String(memberId) === String(userId),
  );

  if (!isMember) {
    throw new ApiError("Forbidden: You are not a member of this group", 403);
  }

  return task;
}

async function updateTask(taskId, userId, payload) {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError("Task not found", 404);
  }

  const group = await assertGroupMembership(task.group, userId);

  const expectedVersion = Number(payload.version);
  if (Number.isNaN(expectedVersion)) {
    throw new ApiError("Task version is required for updates", 400);
  }

  if (task.__v !== expectedVersion) {
    throw new ApiError(
      "This task was updated by another user. Please refresh and try again.",
      409,
    );
  }

  if (payload.assignedTo) {
    const assigneeIsMember = group.members.some(
      (memberId) => String(memberId) === String(payload.assignedTo),
    );

    if (!assigneeIsMember) {
      throw new ApiError("Assigned user must be a member of this group", 400);
    }
  }

  const previousStatus = task.status;
  const previousAssignee = String(task.assignedTo);

  if (payload.title !== undefined) task.title = payload.title;
  if (payload.description !== undefined) task.description = payload.description;
  if (payload.assignedTo !== undefined) task.assignedTo = payload.assignedTo;

  if (payload.status !== undefined) {
    if (!validStatuses.includes(payload.status)) {
      throw new ApiError("Invalid status value", 400);
    }

    if (
      payload.status !== task.status &&
      !allowedTransitions[task.status].includes(payload.status)
    ) {
      throw new ApiError(
        `Invalid status transition from ${task.status} to ${payload.status}`,
        400,
      );
    }

    task.status = payload.status;
  }

  if (payload.priority !== undefined) {
    if (!validPriorities.includes(payload.priority)) {
      throw new ApiError("Invalid priority value", 400);
    }
    task.priority = payload.priority;
  }

  if (payload.deadline !== undefined) task.deadline = payload.deadline;

  const updatedTask = await task.save();

  if (payload.assignedTo && String(payload.assignedTo) !== previousAssignee) {
    await notificationService.createNotification({
      recipient: payload.assignedTo,
      type: "TASK_ASSIGNED",
      message: "You have been assigned a new task.",
      relatedTask: task._id,
      relatedGroup: task.group,
    });
  }

  const recipients = group.members
    .map((value) => String(value))
    .filter((value) => value !== String(userId));

  if (previousStatus !== "done" && task.status === "done") {
    await notificationService.createBulkNotifications(
      recipients.map((recipient) => ({
        recipient,
        type: "TASK_COMPLETED",
        message: `${task.title} has been completed.`,
        relatedTask: task._id,
        relatedGroup: task.group,
      })),
    );
  } else {
    await notificationService.createBulkNotifications(
      recipients.map((recipient) => ({
        recipient,
        type: "TASK_UPDATED",
        message: `${task.title} was updated.`,
        relatedTask: task._id,
        relatedGroup: task.group,
      })),
    );
  }

  emitToGroup(String(task.group), "task:updated", { taskId: String(task._id) });
  if (previousStatus !== task.status) {
    emitToGroup(String(task.group), "task:statusChanged", {
      taskId: String(task._id),
      status: task.status,
    });
  }

  return updatedTask;
}

async function deleteTask(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError("Task not found", 404);
  }

  await assertGroupMembership(task.group, userId);

  await Promise.all([
    Comment.deleteMany({ task: taskId }),
    require("../models/Notification").deleteMany({ relatedTask: taskId }),
    task.deleteOne(),
  ]);

  emitToGroup(String(task.group), "task:deleted", { taskId: String(task._id) });
}

async function getAllUserTasks(userId, query) {
  const Group = require("../models/Group");

  // Get all groups where user is a member
  const userGroups = await Group.find({ members: userId });
  const groupIds = userGroups.map((g) => g._id);

  const filters = {
    group: { $in: groupIds },
    ...buildTaskFilters(query),
  };

  return Task.find(filters)
    .populate("assignedTo", "name email avatar role")
    .populate("createdBy", "name email avatar role")
    .populate("group", "name")
    .sort({ createdAt: -1 });
}

module.exports = {
  getGroupTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAllUserTasks,
};
