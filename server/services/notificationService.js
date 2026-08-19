const Notification = require("../models/Notification");
const { assertGroupMembership } = require("./groupService");
const { emitToUser } = require("./realtimeService");

/**
 * Create a notification for one user.
 */
async function createNotification({
  recipient,
  type,
  message,
  relatedTask = null,
  relatedGroup = null,
}) {
  if (!recipient || !type || !message) {
    throw new Error("Recipient, type and message are required");
  }

  const notification = await Notification.create({
    recipient,
    type,
    message,
    relatedTask,
    relatedGroup,
    isRead: false,
  });

  emitToUser(String(notification.recipient), "notification:new", notification);

  return notification;
}

/**
 * Create notifications for multiple users.
 */
async function createBulkNotifications(payloads = []) {
  if (!Array.isArray(payloads) || payloads.length === 0) {
    return [];
  }

  const validPayloads = payloads
    .filter((payload) => payload.recipient && payload.type && payload.message)
    .map((payload) => ({
      ...payload,
      relatedTask: payload.relatedTask || null,
      relatedGroup: payload.relatedGroup || null,
      isRead: false,
    }));

  if (validPayloads.length === 0) {
    return [];
  }

  const notifications = await Notification.insertMany(validPayloads);

  notifications.forEach((notification) => {
    emitToUser(
      String(notification.recipient),
      "notification:new",
      notification,
    );
  });

  return notifications;
}

/**
 * Get all notifications belonging to a user.
 */
async function getUserNotifications(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return Notification.find({ recipient: userId })
    .populate("relatedTask", "title status")
    .populate("relatedGroup", "name")
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Get activity recorded for a group. Bulk notifications create one document per
 * recipient, so collapse identical event copies before returning the feed.
 */
async function getGroupActivity(groupId, userId) {
  await assertGroupMembership(groupId, userId);

  const notifications = await Notification.find({ relatedGroup: groupId })
    .populate("relatedTask", "title status")
    .sort({ createdAt: -1 })
    .lean();

  const seen = new Set();
  return notifications.filter((notification) => {
    const key = [
      notification.type,
      notification.message,
      notification.relatedTask?._id || notification.relatedTask || "",
      notification.createdAt?.toISOString?.() || notification.createdAt,
    ].join(":");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Mark one notification as read.
 */
async function markAsRead(userId, notificationId) {
  if (!userId || !notificationId) {
    throw new Error("User ID and notification ID are required");
  }

  return Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      $set: { isRead: true },
    },
    {
      new: true,
      runValidators: true,
    },
  );
}

/**
 * Mark all notifications belonging to a user as read.
 */
async function markAllAsRead(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: { isRead: true },
    },
  );

  return result.modifiedCount;
}

/**
 * Count unread notifications belonging to a user.
 */
async function unreadCount(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  getGroupActivity,
  markAsRead,
  markAllAsRead,
  unreadCount,
};
