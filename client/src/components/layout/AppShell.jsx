import MobileNav from "./MobileNav.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />

      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <Topbar />
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-10 sm:px-6 md:px-8 lg:px-10">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
