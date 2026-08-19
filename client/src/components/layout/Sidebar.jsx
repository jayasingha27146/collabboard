import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import LogoMark from "../common/LogoMark.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/groups", label: "My Groups", icon: Users },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col overflow-hidden bg-slate-950 px-4 py-5 text-white md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <LogoMark />
        <div>
          <p className="font-semibold tracking-tight text-white">CollabBoard</p>
          <p className="text-xs text-slate-400">Student workspace</p>
        </div>
      </div>

      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Workspace
      </p>
      <nav className="space-y-1.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight
              size={14}
              className="opacity-0 transition group-hover:opacity-60"
            />
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-violet-500/5 p-4">
        <p className="text-sm font-semibold">Stay on track</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Plan together, finish stronger.
        </p>
      </div>
    </aside>
  );
}
