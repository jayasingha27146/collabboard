export const statusLabels = {
  todo: "To Do",
  doing: "Doing",
  done: "Done",
};

export const statusValues = {
  "To Do": "todo",
  Doing: "doing",
  Done: "done",
};

export function toUiTask(task) {
  return {
    ...task,
    id: task._id,
    groupId: task.group?._id || task.group,
    groupName: task.group?.name || "Study Group",
    assigneeId: task.assignedTo?._id || task.assignedTo,
    assigneeName: task.assignedTo?.name || "Unassigned",
    assigneeAvatar: task.assignedTo?.avatar || "",
    priority: `${task.priority.charAt(0).toUpperCase()}${task.priority.slice(1)}`,
    status: statusLabels[task.status] || task.status,
  };
}
