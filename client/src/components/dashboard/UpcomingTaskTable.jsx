import Badge from "../common/Badge.jsx";
import Card from "../common/Card.jsx";

export default function UpcomingTaskTable({ tasks }) {
  return (
    <Card>
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Schedule</p><h3 className="mt-1 text-lg font-semibold text-slate-900">Upcoming Tasks</h3></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{tasks.length} tasks</span></div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-2">Task</th>
              <th className="pb-2">Group</th>
              <th className="pb-2">Assigned</th>
              <th className="pb-2">Deadline</th>
              <th className="pb-2">Priority</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr className="transition hover:bg-slate-50/80" key={task._id || task.id}>
                <td className="py-3 font-medium text-slate-800">
                  {task.title}
                </td>
                <td className="py-3 text-slate-600">{task.group?.name || task.groupName}</td>
                <td className="py-3 text-slate-600">{task.assignedTo?.name || task.assigneeName}</td>
                <td className="py-3 text-slate-600">
                  {new Date(task.deadline).toLocaleString()}
                </td>
                <td className="py-3">
                  <Badge>{task.priority}</Badge>
                </td>
                <td className="py-3">
                  <Badge>{task.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
