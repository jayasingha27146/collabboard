const mongoose = require("mongoose");
const Group = require("../models/Group");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function assertGroupExists(groupId) {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError("Group not found", 404);
  }
  return group;
}

async function assertGroupMembership(groupId, userId) {
  const group = await assertGroupExists(groupId);
  const isMember = group.members.some(
    (memberId) => String(memberId) === String(userId),
  );

  if (!isMember) {
    throw new ApiError("Forbidden: You are not a member of this group", 403);
  }

  return group;
}

async function assertGroupOwner(groupId, userId) {
  const group = await assertGroupExists(groupId);
  if (String(group.owner) !== String(userId)) {
    throw new ApiError(
      "Forbidden: Only group owner can perform this action",
      403,
    );
  }
  return group;
}

async function getUserGroups(userId, search) {
  const criteria = {
    members: userId,
  };

  if (search) {
    criteria.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const groups = await Group.find(criteria)
    .populate("owner", "name email role avatar")
    .populate("members", "name email role avatar")
    .sort({ createdAt: -1 })
    .lean();

  const groupIds = groups.map((group) => group._id);
  const taskCounts = await Task.aggregate([
    {
      $match: {
        group: { $in: groupIds },
        status: { $ne: "done" },
      },
    },
    {
      $group: {
        _id: "$group",
        activeTasks: { $sum: 1 },
      },
    },
  ]);

  const activeTaskCounts = new Map(
    taskCounts.map((item) => [String(item._id), item.activeTasks]),
  );

  return groups.map((group) => ({
    ...group,
    memberCount: group.members.length,
    activeTasks: activeTaskCounts.get(String(group._id)) || 0,
  }));
}

async function createGroup(payload, userId) {
  return Group.create({
    name: payload.name,
    description: payload.description,
    owner: userId,
    members: [userId],
  });
}

async function getGroupDetails(groupId, userId) {
  await assertGroupMembership(groupId, userId);

  const [group, taskStats] = await Promise.all([
    Group.findById(groupId)
      .populate("owner", "name email role avatar")
      .populate("members", "name email role avatar"),
    Task.aggregate([
      {
        $match: {
          group: new mongoose.Types.ObjectId(String(groupId)),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summary = {
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
  };

  taskStats.forEach((item) => {
    summary[item._id] = item.count;
    summary.total += item.count;
  });

  return {
    group,
    taskSummary: summary,
  };
}

async function updateGroup(groupId, userId, payload) {
  await assertGroupOwner(groupId, userId);
  const group = await Group.findByIdAndUpdate(
    groupId,
    {
      $set: {
        name: payload.name,
        description: payload.description,
      },
    },
    { new: true, runValidators: true },
  );

  return group;
}

async function deleteGroup(groupId, userId) {
  await assertGroupOwner(groupId, userId);
  const tasks = await Task.find({ group: groupId }).select("_id").lean();
  const taskIds = tasks.map((task) => task._id);

  await Promise.all([
    Comment.deleteMany({ task: { $in: taskIds } }),
    Notification.deleteMany({
      $or: [
        { relatedGroup: groupId },
        { relatedTask: { $in: taskIds } },
      ],
    }),
    Task.deleteMany({ group: groupId }),
  ]);
  await Group.findByIdAndDelete(groupId);
}

async function joinGroup(groupId, userId) {
  const group = await assertGroupExists(groupId);
  const isMember = group.members.some(
    (memberId) => String(memberId) === String(userId),
  );

  if (isMember) {
    throw new ApiError("User already joined this group", 409);
  }

  group.members.push(userId);
  await group.save();
  return group;
}

async function removeMember(groupId, ownerId, targetUserId) {
  const group = await assertGroupOwner(groupId, ownerId);

  if (String(group.owner) === String(targetUserId)) {
    throw new ApiError("Group owner cannot remove themselves", 400);
  }

  group.members = group.members.filter(
    (memberId) => String(memberId) !== String(targetUserId),
  );
  await group.save();

  return group;
}

async function addMemberByEmail(groupId, ownerId, email) {
  const group = await assertGroupOwner(groupId, ownerId);
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new ApiError("No registered user found with this email", 404);
  }

  const isMember = group.members.some(
    (memberId) => String(memberId) === String(user._id),
  );
  if (isMember) {
    throw new ApiError("User is already a group member", 409);
  }

  group.members.push(user._id);
  await group.save();
  return { group, user };
}

module.exports = {
  getUserGroups,
  createGroup,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  joinGroup,
  addMemberByEmail,
  removeMember,
  assertGroupMembership,
  assertGroupOwner,
};
