const taskService = require("../services/taskService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");

const getAllUserTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getAllUserTasks(req.user._id, req.query);
  return successResponse(res, "All user tasks fetched successfully", tasks);
});

const getGroupTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getGroupTasks(
    req.params.groupId,
    req.user._id,
    req.query,
  );

  return successResponse(res, "Tasks fetched successfully", tasks);
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(
    req.params.groupId,
    req.user._id,
    req.body,
  );
  return successResponse(res, "Task created successfully", task, 201);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.user._id);
  return successResponse(res, "Task fetched successfully", task);
});

const updateTask = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    version: req.body.version ?? req.headers["if-match"],
  };

  const task = await taskService.updateTask(
    req.params.taskId,
    req.user._id,
    payload,
  );
  return successResponse(res, "Task updated successfully", task);
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.user._id);
  return successResponse(res, "Task deleted successfully", null);
});

module.exports = {
  getAllUserTasks,
  getGroupTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
