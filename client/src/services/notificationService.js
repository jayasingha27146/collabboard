import api from "./api.js";

export async function getNotifications() {
  const response = await api.get("/notifications");
  return response.data;
}

export async function markNotificationAsRead(notificationId) {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch("/notifications/read-all");
  return response.data;
}

// Backwards-compatible name used by the notification bell.
export const markAsRead = markNotificationAsRead;

export async function getUnreadNotificationCount() {
  const response = await api.get("/notifications/unread-count");
  return response.data;
}
