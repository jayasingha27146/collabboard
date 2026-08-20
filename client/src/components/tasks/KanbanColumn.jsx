import TaskCard from "./TaskCard.jsx";

export default function KanbanColumn({
  title,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  canChangeStatus,
}) {
  return (
    <section className="min-w-[290px] rounded-2xl border border-slate-200 bg-slate-100/70 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          {title}
        </h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            canChangeStatus={canChangeStatus ? canChangeStatus(task) : true}
          />
        ))}
      </div>
    </section>
  );
}
