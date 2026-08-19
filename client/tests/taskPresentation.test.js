import assert from "node:assert/strict";
import test from "node:test";
import { statusLabels, statusValues, toUiTask } from "../src/utils/taskPresentation.js";

test("maps database task statuses to readable labels", () => {
  assert.equal(statusLabels.todo, "To Do");
  assert.equal(statusLabels.doing, "Doing");
  assert.equal(statusLabels.done, "Done");
});

test("maps task status labels back to API values", () => {
  assert.equal(statusValues["To Do"], "todo");
  assert.equal(statusValues.Doing, "doing");
  assert.equal(statusValues.Done, "done");
});

test("formats populated API task data for the task cards", () => {
  const task = toUiTask({
    _id: "task-1",
    title: "Write tests",
    status: "todo",
    priority: "high",
    group: { _id: "group-1", name: "QA Group" },
    assignedTo: { _id: "user-1", name: "Asha", avatar: "AS" },
  });

  assert.equal(task.id, "task-1");
  assert.equal(task.groupName, "QA Group");
  assert.equal(task.assigneeName, "Asha");
  assert.equal(task.priority, "High");
  assert.equal(task.status, "To Do");
});
