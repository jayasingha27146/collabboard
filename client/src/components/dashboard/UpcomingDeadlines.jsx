import Badge from "../common/Badge.jsx";
import Card from "../common/Card.jsx";

export default function UpcomingDeadlines({ tasks }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Focus</p><h3 className="mt-1 text-lg font-semibold text-slate-900">
        Upcoming Deadlines
      </h3>
      <ul className="mt-4 space-y-3">
        {tasks.map((task) => (
          <li
            key={task._id || task.id}
            className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3 transition hover:border-primary-100 hover:bg-primary-50/40"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">{task.title}</p>
              <Badge>{task.priority}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">{task.group?.name || task.groupName}</p>
            <p className="mt-2 text-xs text-slate-600">
              Due: {new Date(task.deadline).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
