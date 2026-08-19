import { CheckCircle2 } from "lucide-react";
import Button from "../common/Button.jsx";

export default function NotificationItem({ notification, onMarkAsRead }) {
  return (
    <article
      className={`rounded-xl border p-4 transition ${
        notification.isRead
          ? "border-slate-200 bg-white text-slate-600"
          : "border-primary-200 bg-primary-50/70 text-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{notification.message || notification.text}</p>
          <p className="mt-1 text-xs text-slate-500">
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : notification.time}
          </p>
        </div>
        {!notification.isRead && (
          <Button
            variant="primary"
            className="shrink-0 border border-primary-500 px-3 py-1.5 text-xs shadow-md shadow-primary-200 ring-2 ring-primary-100 hover:ring-primary-200"
            onClick={() => onMarkAsRead(notification._id || notification.id)}
          >
            <CheckCircle2 size={14} className="mr-1" /> Mark as read
          </Button>
        )}
      </div>
    </article>
  );
}
