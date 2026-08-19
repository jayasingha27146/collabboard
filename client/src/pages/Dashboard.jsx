import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardCard from "../components/dashboard/DashboardCard.jsx";
import RecentActivityList from "../components/dashboard/RecentActivityList.jsx";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines.jsx";
import UpcomingTaskTable from "../components/dashboard/UpcomingTaskTable.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import { getDashboard } from "../services/dashboardService.js";
import { getNotifications } from "../services/notificationService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, notificationsResponse] = await Promise.all([
        getDashboard(),
        getNotifications(),
      ]);
      setDashboard(dashboardResponse.data);
      setActivities((notificationsResponse.data || []).slice(0, 5));
    } catch (requestError) {
      setDashboard(null);
      setActivities([]);
      setError(requestError.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = dashboard || {
    totalGroups: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    upcomingTasks: [],
  };
  const upcomingTasks = summary.upcomingTasks || [];

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-200 sm:px-8 sm:py-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300"><CalendarDays size={14} /> Your workspace</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, {user?.fullName?.split(" ")[0] || "Student"} <span aria-hidden="true">👋</span></h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Keep your groups moving and turn today’s priorities into progress.</p>
          </div>
          <Link to="/tasks" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"><Plus size={16} /> View tasks <ArrowRight size={15} /></Link>
        </div>
      </section>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <>
          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Total Groups" value={summary.totalGroups} />
            <DashboardCard
              label="Active Tasks"
              value={summary.activeTasks}
              accent="bg-sky-100"
            />
            <DashboardCard
              label="Completed Tasks"
              value={summary.completedTasks}
              accent="bg-emerald-100"
            />
            <DashboardCard
              label="Overdue Tasks"
              value={summary.overdueTasks}
              accent="bg-rose-100"
            />
          </section>

          {error && <p className="mt-4 text-sm text-amber-700">{error}</p>}

          {upcomingTasks.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No tasks available."
                description="There are no active tasks in your groups."
              />
            </div>
          ) : (
            <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <UpcomingTaskTable tasks={upcomingTasks} />
              </div>
              <UpcomingDeadlines tasks={upcomingTasks.slice(0, 4)} />
            </section>
          )}

          <section className="mt-6">
            {activities.length > 0 && <RecentActivityList items={activities} />}
          </section>
        </>
      )}
    </AppShell>
  );
}
