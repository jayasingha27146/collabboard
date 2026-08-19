const Comment = require("../models/Comment");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/response");
const { assertGroupMembership } = require("../services/groupService");
const notificationService = require("../services/notificationService");

const getTaskComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    throw new ApiError("Task not found", 404);
  }

  await assertGroupMembership(task.group, req.user._id);

  const comments = await Comment.find({ task: req.params.taskId })
    .populate("user", "name email avatar role")
    .sort({ createdAt: -1 });

  return successResponse(res, "Comments fetched successfully", comments);
});

const createComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    throw new ApiError("Task not found", 404);
  }

  const group = await assertGroupMembership(task.group, req.user._id);

  const comment = await Comment.create({
    task: task._id,
    user: req.user._id,
    content: req.body.content,
  });

  const recipients = group.members
    .map((value) => String(value))
    .filter((value) => value !== String(req.user._id));

  await notificationService.createBulkNotifications(
    recipients.map((recipient) => ({
      recipient,
      type: "COMMENT_ADDED",
      message: "A new comment was added to your task.",
      relatedTask: task._id,
      relatedGroup: task.group,
    })),
  );

  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "name email avatar role",
  );

  return successResponse(
    res,
    "Comment added successfully",
    populatedComment,
    201,
  );
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId).populate("task");
  if (!comment) {
    throw new ApiError("Comment not found", 404);
  }

  await assertGroupMembership(comment.task.group, req.user._id);

  if (String(comment.user) !== String(req.user._id)) {
    throw new ApiError("Forbidden: You can only edit your own comments", 403);
  }

  comment.content = req.body.content;
  await comment.save();

  const populatedComment = await Comment.findById(comment._id).populate(
    "user",
    "name email avatar role",
  );

  return successResponse(res, "Comment updated successfully", populatedComment);
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId).populate("task");
  if (!comment) {
    throw new ApiError("Comment not found", 404);
  }

  const group = await assertGroupMembership(comment.task.group, req.user._id);
  const isOwner = String(group.owner) === String(req.user._id);
  const isAuthor = String(comment.user) === String(req.user._id);

  if (!isOwner && !isAuthor) {
    throw new ApiError("Forbidden: You cannot delete this comment", 403);
  }

  await comment.deleteOne();
  return successResponse(res, "Comment deleted successfully", null);
});

module.exports = {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
};
