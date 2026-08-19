import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar.jsx";
import Badge from "../common/Badge.jsx";
import Button from "../common/Button.jsx";
import Card from "../common/Card.jsx";

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const statusFlow = ["To Do", "Doing", "Done"];
  const statusIndex = statusFlow.indexOf(task.status);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/tasks/${task.id}`}
            className="text-sm font-semibold text-slate-800 hover:underline"
          >
            {task.title}
          </Link>
          <p className="mt-1 text-xs text-slate-500">{task.description}</p>
        </div>
        <Badge>{task.priority}</Badge>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Avatar
            initials={task.assigneeAvatar}
            className="h-7 w-7 text-[10px]"
          />
          <span>{task.assigneeName}</span>
        </div>
        <span className="flex items-center gap-1">
          <CalendarDays size={12} />
          {new Date(task.deadline).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge>{task.status}</Badge>

        <div className="flex items-center gap-1">
          {statusIndex < statusFlow.length - 1 && (
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              onClick={() =>
                onStatusChange(task.id, statusFlow[statusIndex + 1])
              }
            >
              Move
            </Button>
          )}
          <Button
            variant="ghost"
            className="px-2 py-1"
            onClick={() => onEdit(task)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            className="px-2 py-1 text-rose-600"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
