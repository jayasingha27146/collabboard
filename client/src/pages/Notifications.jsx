import { useEffect, useState } from "react";
import Button from "../components/common/Button.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import NotificationItem from "../components/notifications/NotificationItem.jsx";
import * as notificationService from "../services/notificationService.js";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    notificationService
      .getNotifications()
      .then((response) => setNotifications(response.data || []))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markNotificationAsRead(id);
      setNotifications((current) =>
        current.map((notification) =>
          (notification._id || notification.id) === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <AppShell>
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            In-app updates for assignments, groups, and deadlines.
          </p>
        </div>
        <Button
          variant={unreadCount > 0 ? "primary" : "secondary"}
          disabled={unreadCount === 0}
          onClick={markAllAsRead}
        >
          Mark all as read{unreadCount > 0 ? ` (${unreadCount})` : ""}
        </Button>
      </section>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {notifications.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No notifications."
            description="You are all caught up right now."
          />
        </div>
      ) : (
        <section className="mt-6 space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id || notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </section>
      )}
    </AppShell>
  );
}
