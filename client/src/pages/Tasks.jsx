import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import TaskModal from "../components/tasks/TaskModal.jsx";
import { getGroups } from "../services/groupService.js";
import * as taskService from "../services/taskService.js";
import { statusValues, toUiTask } from "../utils/taskPresentation.js";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        const [tasksResponse, groupsResponse] = await Promise.all([
          taskService.getTasks(),
          getGroups(),
        ]);
        setTasks((tasksResponse.data || []).map(toUiTask));
        setGroups(groupsResponse.data || []);
      } catch (requestError) {
        setError(requestError.message || "Could not load tasks.");
      }
    }
    loadTasks();
  }, []);

  const selectedGroup = groups[0];
  const members = (selectedGroup?.members || []).map((member) => ({
    id: member._id,
    fullName: member.name,
    avatar: member.avatar,
  }));

  const filteredTasks = useMemo(() => {
    if (selectedStatus === "All") {
      return tasks;
    }
    return tasks.filter((task) => task.status === selectedStatus);
  }, [tasks, selectedStatus]);

  const handleSaveTask = async (payload) => {
    const member = members.find((item) => item.id === payload.assigneeId);

    if (editingTask) {
      try {
        const response = await taskService.updateTask(editingTask.id, {
          title: payload.title,
          description: payload.description,
          assignedTo: payload.assigneeId,
          priority: payload.priority.toLowerCase(),
          status: statusValues[payload.status],
          deadline: payload.deadline,
          version: editingTask.__v,
        });
        const updatedTask = toUiTask({
          ...editingTask,
          ...response.data,
          group: editingTask.group,
          assignedTo: {
            _id: payload.assigneeId,
            name: member?.fullName || editingTask.assigneeName,
            avatar: member?.avatar || editingTask.assigneeAvatar,
          },
        });
        setTasks((current) =>
          current.map((task) => (task.id === editingTask.id ? updatedTask : task)),
        );
        setEditingTask(null);
      } catch (requestError) {
        setError(requestError.message || "Could not update task.");
        return false;
      }
      return true;
    }

    if (!selectedGroup) {
      setError("Create a group first, then create a task.");
      return false;
    }

    try {
      const response = await taskService.createTask({
        groupId: selectedGroup._id,
        title: payload.title,
        description: payload.description,
        assignedTo: payload.assigneeId,
        priority: payload.priority.toLowerCase(),
        deadline: payload.deadline,
      });
      const savedTask = toUiTask({
        ...response.data,
        group: { _id: selectedGroup._id, name: selectedGroup.name },
        assignedTo: {
          _id: payload.assigneeId,
          name: member?.fullName || "Unknown",
          avatar: member?.avatar || "",
        },
      });
      setTasks((current) => [savedTask, ...current]);
    } catch (requestError) {
      setError(requestError.message || "Could not save task.");
      return false;
    }

    return true;
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task permanently?")) {
      return;
    }
    try {
      await taskService.deleteTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (requestError) {
      setError(requestError.message || "Could not delete task.");
    }
  };

  return (
    <AppShell>
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            Manage assignments across all study groups.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setOpenModal(true);
          }}
        >
          Add Task
        </Button>
      </section>

      <section className="mt-6 flex gap-2 overflow-x-auto">
        {["All", "To Do", "Doing", "Done"].map((status) => (
          <button
            key={status}
            className={`rounded-full px-4 py-1.5 text-sm ${
              selectedStatus === status
                ? "bg-primary-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            {status}
          </button>
        ))}
      </section>

      {selectedGroup && (
        <p className="mt-3 text-xs text-slate-500">
          New tasks will be added to: {selectedGroup.name}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      {filteredTasks.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No tasks available."
            description="Create a task to begin tracking progress."
          />
        </div>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <article key={task.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/tasks/${task.id}`}
                  className="text-sm font-semibold text-slate-800 hover:underline"
                >
                  {task.title}
                </Link>
                <Badge>{task.priority}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{task.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                Group: {task.groupName}
              </p>
              <p className="text-xs text-slate-500">
                Assigned: {task.assigneeName}
              </p>
              <p className="text-xs text-slate-500">
                Deadline: {new Date(task.deadline).toLocaleString()}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <Badge>{task.status}</Badge>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="px-2 py-1 text-xs"
                    onClick={() => {
                      setEditingTask(task);
                      setOpenModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-xs text-rose-600"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <TaskModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSaveTask}
        members={members}
        initialTask={editingTask}
      />
    </AppShell>
  );
}
