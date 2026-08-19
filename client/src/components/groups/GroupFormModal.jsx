import { useState } from "react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Modal from "../common/Modal.jsx";

const emptyData = {
  name: "",
  description: "",
  imageUrl: "",
};

export default function GroupFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(emptyData);
  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Group name is required.";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(formData);
    setFormData(emptyData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Study Group"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="group-form">
            Create Group
          </Button>
        </div>
      }
    >
      <form id="group-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Group Name"
          value={formData.name}
          onChange={(event) => setField("name", event.target.value)}
          error={errors.name}
        />
        <Input
          label="Description"
          value={formData.description}
          onChange={(event) => setField("description", event.target.value)}
          error={errors.description}
        />
        <Input
          label="Group Image URL (optional)"
          value={formData.imageUrl}
          onChange={(event) => setField("imageUrl", event.target.value)}
        />
      </form>
    </Modal>
  );
}
