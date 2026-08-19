const notificationService = require("../services/notificationService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/response");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(
    req.user._id,
  );
  return successResponse(
    res,
    "Notifications fetched successfully",
    notifications,
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.user._id,
    req.params.notificationId,
  );

  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  return successResponse(res, "Notification marked as read", notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const modifiedCount = await notificationService.markAllAsRead(req.user._id);
  return successResponse(res, "All notifications marked as read", {
    modifiedCount,
  });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user._id);
  return successResponse(res, "Unread count fetched successfully", { count });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  unreadCount,
};
