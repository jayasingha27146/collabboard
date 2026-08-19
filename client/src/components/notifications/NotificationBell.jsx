import { Bell } from "lucide-react";
import Dropdown from "../common/Dropdown.jsx";
import Button from "../common/Button.jsx";

export default function NotificationBell({ notifications = [], onMarkRead }) {
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <Dropdown
      trigger={
        <button className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      {({ close }) => (
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-slate-800">
              Notifications
            </p>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <button
                key={notification.id}
                className={`w-full rounded-lg px-2 py-2 text-left text-xs ${
                  notification.isRead
                    ? "bg-slate-50 text-slate-500"
                    : "bg-primary-50 text-slate-700"
                }`}
                onClick={() => {
                  onMarkRead?.(notification.id);
                  close();
                }}
              >
                {notification.text}
                <span className="ml-1 text-[10px] text-slate-400">
                  {notification.time}
                </span>
              </button>
            ))}
          </div>
          <Button className="mt-2 w-full" variant="secondary" onClick={close}>
            Close
          </Button>
        </div>
      )}
    </Dropdown>
  );
}
