import {
  Bell,
  LayoutDashboard,
  ListTodo,
  UserCircle2,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/groups", icon: Users, label: "Groups" },
  { to: "/tasks", icon: ListTodo, label: "Tasks" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
  { to: "/profile", icon: UserCircle2, label: "Profile" },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center rounded-lg px-1 py-2 text-[11px] ${
                  isActive ? "text-primary-700" : "text-slate-500"
                }`
              }
            >
              <Icon size={16} />
              <span className="mt-1">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
