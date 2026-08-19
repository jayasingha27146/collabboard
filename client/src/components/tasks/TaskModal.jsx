import { useEffect, useMemo, useState } from "react";
import { storageKeys } from "../../utils/storage.js";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Modal from "../common/Modal.jsx";

const emptyTask = {
  title: "",
  description: "",
  assigneeId: "",
  priority: "Medium",
  deadline: "",
  status: "To Do",
};

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  members,
  initialTask,
  groupId,
}) {
  const [formData, setFormData] = useState(emptyTask);
  const [errors, setErrors] = useState({});

  const storageKey = useMemo(
    () => `${storageKeys.taskDraft}.${groupId || "global"}`,
    [groupId],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialTask) {
      setFormData({
        title: initialTask.title,
        description: initialTask.description,
        assigneeId: initialTask.assigneeId,
        priority: initialTask.priority,
        deadline: initialTask.deadline.slice(0, 16),
        status: initialTask.status,
      });
      return;
    }

    const draft = localStorage.getItem(storageKey);
    if (draft) {
      setFormData(JSON.parse(draft));
    } else {
      setFormData(emptyTask);
    }
  }, [initialTask, isOpen, storageKey]);

  useEffect(() => {
    if (!isOpen || initialTask) {
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, initialTask, isOpen, storageKey]);

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Task title is required.";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!formData.assigneeId) {
      nextErrors.assigneeId = "Please assign a member.";
    }

    if (!formData.deadline) {
      nextErrors.deadline = "Deadline is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const saved = await onSubmit({
      ...formData,
      deadline: new Date(formData.deadline).toISOString(),
    });

    if (saved === false) {
      return;
    }

    localStorage.removeItem(storageKey);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? "Edit Task" : "Create Task"}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="task-form">
            {initialTask ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Task Title"
          value={formData.title}
          onChange={(event) => setField("title", event.target.value)}
          error={errors.title}
        />
        <Input
          label="Description"
          value={formData.description}
          onChange={(event) => setField("description", event.target.value)}
          error={errors.description}
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Assign Member
          </span>
          <select
            value={formData.assigneeId}
            onChange={(event) => setField("assigneeId", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </select>
          {errors.assigneeId && (
            <span className="mt-1 block text-xs text-rose-600">
              {errors.assigneeId}
            </span>
          )}
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Priority
            </span>
            <select
              value={formData.priority}
              onChange={(event) => setField("priority", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </span>
            <select
              value={formData.status}
              onChange={(event) => setField("status", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option>To Do</option>
              <option>Doing</option>
              <option>Done</option>
            </select>
          </label>
        </div>

        <Input
          type="datetime-local"
          label="Deadline"
          value={formData.deadline}
          onChange={(event) => setField("deadline", event.target.value)}
          error={errors.deadline}
        />
      </form>
    </Modal>
  );
}
