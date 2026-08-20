import { useEffect, useState } from "react";
import { ArrowUpRight, ListTodo, LoaderCircle, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import useLocalStorage from "../../hooks/useLocalStorage.js";
import * as notificationService from "../../services/notificationService.js";
import * as groupService from "../../services/groupService.js";
import * as taskService from "../../services/taskService.js";
import { storageKeys } from "../../utils/storage.js";
import Avatar from "../common/Avatar.jsx";
import Dropdown from "../common/Dropdown.jsx";
import NotificationBell from "../notifications/NotificationBell.jsx";

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useLocalStorage(
    `${storageKeys.userPreferences}.searchQuery`,
    "",
  );
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState({ groups: [], tasks: [] });
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await notificationService.getNotifications();
        setNotifications(response?.data || response || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      }
    }

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults({ groups: [], tasks: [] });
      setSearching(false);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setSearching(true);
        const [groupsResponse, tasksResponse] = await Promise.all([
          groupService.getGroups({ search: query }),
          taskService.getTasks({ search: query }),
        ]);
        if (active) {
          setSearchResults({
            groups: (groupsResponse?.data || groupsResponse || []).slice(0, 4),
            tasks: (tasksResponse?.data || tasksResponse || []).slice(0, 4),
          });
        }
      } catch {
        if (active) setSearchResults({ groups: [], tasks: [] });
      } finally {
        if (active) setSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const goToResult = (path) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  const allResults = [
    ...searchResults.groups.map((item) => ({ type: "group", item })),
    ...searchResults.tasks.map((item) => ({ type: "task", item })),
  ];

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((items) =>
        items.map((item) =>
          item.id === notificationId || item._id === notificationId
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 mb-7 border-b border-slate-200/60 bg-[#f7f8fc]/85 px-4 py-3.5 backdrop-blur-xl sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
        <form
          className="relative w-full max-w-xl"
          onSubmit={(event) => {
            event.preventDefault();
            const first = allResults[0];
            if (first) goToResult(first.type === "group" ? `/groups/${first.item._id || first.item.id}` : `/tasks/${first.item._id || first.item.id}`);
          }}
        >
          <Search
            className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <input
            className="w-full rounded-xl border border-slate-200/80 bg-white/80 py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none ring-primary-100 transition placeholder:text-slate-400 focus:border-primary-300 focus:ring-2"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
            placeholder="Search groups and tasks..."
            aria-label="Search groups and tasks"
          />
          {searchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/50">
              {searching ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={17} /> Searching...</div>
              ) : allResults.length === 0 ? (
                <div className="px-4 py-8 text-center"><Search className="mx-auto text-slate-300" size={22} /><p className="mt-2 text-sm font-medium text-slate-700">No results found</p><p className="mt-1 text-xs text-slate-400">Try a different group or task name.</p></div>
              ) : (
                <div>
                  {searchResults.groups.length > 0 && <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Groups</p>}
                  {searchResults.groups.map((group) => <button type="button" key={group._id || group.id} onMouseDown={(event) => event.preventDefault()} onClick={() => goToResult(`/groups/${group._id || group.id}`)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-primary-50"><span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Users size={15} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{group.name}</span><span className="block truncate text-xs text-slate-400">{group.description || "Study group"}</span></span><ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary-500" /></button>)}
                  {searchResults.tasks.length > 0 && <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tasks</p>}
                  {searchResults.tasks.map((task) => <button type="button" key={task._id || task.id} onMouseDown={(event) => event.preventDefault()} onClick={() => goToResult(`/tasks/${task._id || task.id}`)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-primary-50"><span className="rounded-lg bg-violet-50 p-2 text-violet-600"><ListTodo size={15} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{task.title}</span><span className="block truncate text-xs capitalize text-slate-400">{task.status || "Task"} · {task.priority || "Normal"}</span></span><ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary-500" /></button>)}
                  <p className="border-t border-slate-100 px-3 pb-1 pt-2 text-[10px] text-slate-400">Press Enter to open the first result</p>
                </div>
              )}
            </div>
          )}
        </form>

        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            onMarkRead={handleMarkAsRead}
          />

          <Dropdown
            trigger={
              <button className="rounded-xl border border-slate-200/80 bg-white px-2 py-1.5 shadow-sm transition hover:border-slate-300 hover:shadow">
                <span className="flex items-center gap-2">
                  <Avatar initials={user?.avatar || "SU"} className="h-8 w-8" />
                  <span className="hidden text-left text-xs leading-tight sm:block">
                    <span className="block font-semibold text-slate-800">
                      {user?.fullName}
                    </span>
                    <span className="block text-slate-500">
                      {user?.role === "group_leader" ? "Group Leader" : "Team Member"}
                    </span>
                  </span>
                </span>
              </button>
            }
          >
            {({ close }) => (
              <div className="space-y-1 text-sm">
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    navigate("/profile");
                    close();
                  }}
                >
                  View Profile
                </button>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    logout();
                    navigate("/login");
                    close();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
