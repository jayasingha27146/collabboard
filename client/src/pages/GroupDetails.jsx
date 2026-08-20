import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Avatar from "../components/common/Avatar.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import TaskModal from "../components/tasks/TaskModal.jsx";
import KanbanColumn from "../components/tasks/KanbanColumn.jsx";
import {
  groups,
  members as initialMembers,
  tasks as initialTasks,
} from "../utils/mockData.js";
import { safeWrite, storageKeys } from "../utils/storage.js";
import * as groupService from "../services/groupService.js";
import * as taskService from "../services/taskService.js";
import { statusValues, toUiTask } from "../utils/taskPresentation.js";
import { useAuth } from "../context/AuthContext.jsx";

const tabs = ["Overview", "Tasks", "Members", "Activity"];

export default function GroupDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [members, setMembers] = useState(initialMembers);
  const [group, setGroup] = useState(
    groups.find((item) => item.id === id) || groups[0],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activities, setActivities] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  useEffect(() => {
    async function loadGroup() {
      const demoGroup = groups.find((item) => item.id === id);

      if (demoGroup) {
        setGroup(demoGroup);
        setMembers(initialMembers);
        setTasks(initialTasks);
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [groupResponse, taskResponse, activityResponse] =
          await Promise.all([
            groupService.getGroup(id),
            taskService.getGroupTasks(id),
            groupService.getGroupActivity(id),
          ]);
        const details = groupResponse?.data || groupResponse;
        const liveGroup = details?.group || details;
        const ownerId = String(liveGroup?.owner?._id || liveGroup?.owner || "");

        setGroup({
          ...liveGroup,
          id: liveGroup?._id || id,
          owner: liveGroup?.owner?.name || "Unknown",
          ownerId,
        });
        setMembers(
          (liveGroup?.members || []).map((member) => ({
            id: member._id || member.id,
            fullName: member.name || member.fullName || "Unknown member",
            email: member.email || "No email available",
            role:
              String(member._id || member.id) === ownerId
                ? "Group Admin"
                : "Member",
            avatar:
              member.avatar ||
              (member.name || member.fullName || "Member")
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase(),
          })),
        );
        setTasks((taskResponse?.data || taskResponse || []).map(toUiTask));
        setActivities(activityResponse?.data || activityResponse || []);
      } catch (requestError) {
        setError(requestError.message || "Could not load this group.");
      } finally {
        setLoading(false);
      }
    }

    loadGroup();
  }, [id]);

  const groupTasks = useMemo(
    () => tasks.filter((task) => String(task.groupId) === String(group.id)),
    [tasks, group.id],
  );
  const isOwner = String(group.ownerId || "") === String(user?.id || "");

  safeWrite(storageKeys.recentGroupId, group.id);

  const openCreateTask = () => {
    setEditingTask(null);
    setOpenTaskModal(true);
  };

  const handleSaveTask = async (payload) => {
    const assignee = members.find((member) => member.id === payload.assigneeId);

    if (editingTask) {
      try {
        setActionError("");
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
          ...(response?.data || response),
          group: { _id: group.id, name: group.name },
          assignedTo: {
            _id: payload.assigneeId,
            name: assignee?.fullName || editingTask.assigneeName,
            avatar: assignee?.avatar || editingTask.assigneeAvatar,
          },
        });
        setTasks((current) =>
          current.map((task) =>
            task.id === editingTask.id ? updatedTask : task,
          ),
        );
        setEditingTask(null);
        return true;
      } catch (requestError) {
        setActionError(requestError.message || "Could not update task.");
        return false;
      }
    }

    try {
      setActionError("");
      const response = await taskService.createTask({
        groupId: group.id,
        title: payload.title,
        description: payload.description,
        assignedTo: payload.assigneeId,
        priority: payload.priority.toLowerCase(),
        status: statusValues[payload.status],
        deadline: payload.deadline,
      });
      const savedTask = toUiTask({
        ...(response?.data || response),
        group: { _id: group.id, name: group.name },
        assignedTo: {
          _id: payload.assigneeId,
          name: assignee?.fullName || "Unknown",
          avatar: assignee?.avatar || "",
        },
      });
      setTasks((current) => [savedTask, ...current]);
      return true;
    } catch (requestError) {
      setActionError(requestError.message || "Could not create task.");
      return false;
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Delete this task? This action cannot be undone.",
    );
    if (!confirmed) {
      return;
    }
    try {
      setActionError("");
      await taskService.deleteTask(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (requestError) {
      setActionError(requestError.message || "Could not delete task.");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    try {
      setActionError("");
      const response = await taskService.updateTask(taskId, {
        status: statusValues[status],
        version: task.__v,
      });
      const updatedTask = toUiTask({
        ...task,
        ...(response?.data || response),
        group: { _id: group.id, name: group.name },
        assignedTo: {
          _id: task.assigneeId,
          name: task.assigneeName,
          avatar: task.assigneeAvatar,
        },
      });
      setTasks((current) =>
        current.map((item) => (item.id === taskId ? updatedTask : item)),
      );
    } catch (requestError) {
      setActionError(requestError.message || "Could not change task status.");
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!memberEmail.trim()) return;

    try {
      setMemberActionLoading(true);
      setActionError("");
      const response = await groupService.addMember(group.id, memberEmail.trim());
      const addedUser = (response?.data || response)?.user;
      if (addedUser) {
        setMembers((current) => [
          ...current,
          {
            id: addedUser._id || addedUser.id,
            fullName: addedUser.name || addedUser.fullName,
            email: addedUser.email,
            role: "Member",
            avatar:
              addedUser.avatar ||
              (addedUser.name || "Member")
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase(),
          },
        ]);
      }
      setMemberEmail("");
    } catch (requestError) {
      setActionError(requestError.message || "Could not add member.");
    } finally {
      setMemberActionLoading(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.fullName} from this group?`)) return;

    try {
      setMemberActionLoading(true);
      setActionError("");
      await groupService.removeMember(group.id, member.id);
      setMembers((current) =>
        current.filter((item) => String(item.id) !== String(member.id)),
      );
    } catch (requestError) {
      setActionError(requestError.message || "Could not remove member.");
    } finally {
      setMemberActionLoading(false);
    }
  };

  const todoTasks = groupTasks.filter((task) => task.status === "To Do");
  const doingTasks = groupTasks.filter((task) => task.status === "Doing");
  const doneTasks = groupTasks.filter((task) => task.status === "Done");

  if (loading) {
    return <AppShell><div className="glass-card p-8 text-center text-sm text-slate-500">Loading group and member details...</div></AppShell>;
  }

  if (error) {
    return <AppShell><EmptyState title="Could not open this group." description={error} /></AppShell>;
  }

  return (
    <AppShell>
      <section className="glass-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="page-title">{group.name}</h1>
            <p className="page-subtitle">{group.description}</p>
            <p className="mt-3 text-sm text-slate-600">
              Owner: <span className="font-semibold">{group.owner}</span> ·
              Members: <span className="font-semibold">{members.length}</span>
            </p>
          </div>
          {isOwner && <Button variant="secondary">Edit Group</Button>}
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded-full px-4 py-1.5 text-sm ${
                activeTab === tab
                  ? "bg-primary-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {actionError && (
        <p className="mt-4 text-sm text-rose-600">{actionError}</p>
      )}

      {activeTab === "Overview" && (
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="glass-card p-4">
            <p className="text-sm text-slate-500">Active Tasks</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {todoTasks.length + doingTasks.length}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-slate-500">Completed Tasks</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {doneTasks.length}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-slate-500">Members</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {members.length}
            </p>
          </div>
        </section>
      )}

      {activeTab === "Tasks" && (
        <section className="mt-6">
          <div className="mb-3 flex justify-end">
            {isOwner && <Button onClick={openCreateTask}>Add Task</Button>}
          </div>
          <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
            <KanbanColumn
              title="TO DO"
              tasks={todoTasks}
              onEdit={isOwner ? (task) => {
                setEditingTask(task);
                setOpenTaskModal(true);
              } : undefined}
              onDelete={isOwner ? handleDeleteTask : undefined}
              onStatusChange={(taskId, status) => {
                const task = tasks.find((item) => item.id === taskId);
                if (isOwner || String(task?.assigneeId) === String(user?.id)) handleStatusChange(taskId, status);
              }}
              canChangeStatus={(task) => isOwner || String(task.assigneeId) === String(user?.id)}
            />
            <KanbanColumn
              title="DOING"
              tasks={doingTasks}
              onEdit={isOwner ? (task) => {
                setEditingTask(task);
                setOpenTaskModal(true);
              } : undefined}
              onDelete={isOwner ? handleDeleteTask : undefined}
              onStatusChange={(taskId, status) => {
                const task = tasks.find((item) => item.id === taskId);
                if (isOwner || String(task?.assigneeId) === String(user?.id)) handleStatusChange(taskId, status);
              }}
              canChangeStatus={(task) => isOwner || String(task.assigneeId) === String(user?.id)}
            />
            <KanbanColumn
              title="DONE"
              tasks={doneTasks}
              onEdit={isOwner ? (task) => {
                setEditingTask(task);
                setOpenTaskModal(true);
              } : undefined}
              onDelete={isOwner ? handleDeleteTask : undefined}
              onStatusChange={(taskId, status) => {
                const task = tasks.find((item) => item.id === taskId);
                if (isOwner || String(task?.assigneeId) === String(user?.id)) handleStatusChange(taskId, status);
              }}
              canChangeStatus={(task) => isOwner || String(task.assigneeId) === String(user?.id)}
            />
          </div>
        </section>
      )}

      {activeTab === "Members" && (
        <section className="mt-6 glass-card overflow-x-auto p-4">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Group directory</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Added users</h2></div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{members.length} {members.length === 1 ? "member" : "members"}</span>
          </div>
          {isOwner && (
            <form className="mb-5 flex max-w-xl items-end gap-2" onSubmit={handleAddMember}>
              <Input
                containerClassName="min-w-0 flex-1"
                label="Add registered member"
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="member@email.com"
                required
              />
              <Button type="submit" disabled={memberActionLoading}>
                Add member
              </Button>
            </form>
          )}
          <table className="min-w-[700px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-3">Member</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Assigned Tasks</th>
                <th className="pb-3">Completed</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => {
                const assigned = groupTasks.filter(
                  (task) => task.assigneeId === member.id,
                ).length;
                const completed = groupTasks.filter(
                  (task) =>
                    task.assigneeId === member.id && task.status === "Done",
                ).length;

                return (
                  <tr key={member.id}>
                    <td className="py-3">
                      <span className="flex items-center gap-2">
                        <Avatar initials={member.avatar} /> {member.fullName}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{member.email}</td>
                    <td className="py-3">
                      <Badge>{member.role}</Badge>
                    </td>
                    <td className="py-3 text-slate-600">{assigned}</td>
                    <td className="py-3 text-slate-600">{completed}</td>
                    <td className="py-3">
                      {isOwner && member.role !== "Group Admin" ? (
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-rose-600"
                          disabled={memberActionLoading}
                          onClick={() => handleRemoveMember(member)}
                        >
                          Remove
                        </Button>
                      ) : member.role === "Group Admin" ? (
                        <span className="text-xs text-slate-500">
                          Admin protected
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "Activity" && (
        <section className="mt-6">
          {activities.length === 0 ? (
            <EmptyState
              title="No group activity."
              description="Activity will appear as members work."
            />
          ) : (
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li key={activity._id || activity.id} className="glass-card p-4">
                  <p className="text-sm text-slate-700">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.createdAt
                      ? new Date(activity.createdAt).toLocaleString()
                      : activity.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <TaskModal
        isOpen={openTaskModal}
        onClose={() => setOpenTaskModal(false)}
        onSubmit={handleSaveTask}
        members={members}
        initialTask={editingTask}
        groupId={group.id}
      />
    </AppShell>
  );
}
