import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Avatar from "../components/common/Avatar.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import { taskComments, tasks } from "../utils/mockData.js";

export default function TaskDetails() {
  const { taskId } = useParams();
  const task = useMemo(
    () => tasks.find((item) => item.id === taskId) || tasks[0],
    [taskId],
  );

  const [comments, setComments] = useState(taskComments[task.id] || []);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = () => {
    if (!commentText.trim()) {
      return;
    }

    const nextComment = {
      id: `comment-${Date.now()}`,
      author: "You",
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    setComments((current) => [nextComment, ...current]);
    setCommentText("");
  };

  return (
    <AppShell>
      <section className="glass-card p-5">
        <h1 className="page-title">{task.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{task.description}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <Badge className="mt-1">{task.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-slate-500">Priority</p>
            <Badge className="mt-1">{task.priority}</Badge>
          </div>
          <div>
            <p className="text-xs text-slate-500">Deadline</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {new Date(task.deadline).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Assigned Member</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Avatar
                initials={task.assigneeAvatar}
                className="h-7 w-7 text-[10px]"
              />
              {task.assigneeName}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Created</p>
            <p className="mt-1 text-sm text-slate-700">
              {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Last Updated</p>
            <p className="mt-1 text-sm text-slate-700">
              {new Date(task.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 glass-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Comments</h2>

        <div className="mt-4 flex items-end gap-2">
          <Input
            containerClassName="flex-1"
            label="Add Comment"
            placeholder="Write an update for your team"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
          />
          <Button onClick={handleAddComment}>Post</Button>
        </div>

        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  {comment.author}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-700">{comment.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
