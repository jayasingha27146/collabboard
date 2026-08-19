const mongoose = require("mongoose");
const { connectDB, closeDB } = require("../config/db");
const User = require("../models/User");
const Group = require("../models/Group");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");

async function upsertUser(user) {
  const existing = await User.findOne({ email: user.email }).select("+password");
  if (existing) {
    existing.name = user.name;
    existing.avatar = user.avatar;
    await existing.save();
    return existing;
  }

  return User.create(user);
}

async function seed() {
  await connectDB();

  try {
    const [amal, nethmi, kasun] = await Promise.all([
      upsertUser({
        name: "Amal Perera",
        email: "amal@collabboard.local",
        password: "Password123!",
        avatar: "",
      }),
      upsertUser({
        name: "Nethmi Silva",
        email: "nethmi@collabboard.local",
        password: "Password123!",
        avatar: "",
      }),
      upsertUser({
        name: "Kasun Fernando",
        email: "kasun@collabboard.local",
        password: "Password123!",
        avatar: "",
      }),
    ]);

    const members = [amal._id, nethmi._id, kasun._id];
    const group = await Group.findOneAndUpdate(
      { name: "CollabBoard Demo Team", owner: amal._id },
      {
        $set: {
          description: "Sample workspace data for the CollabBoard application.",
          members,
        },
        $setOnInsert: { owner: amal._id, name: "CollabBoard Demo Team" },
      },
      { new: true, upsert: true, runValidators: true },
    );

    const taskDefinitions = [
      {
        title: "Design the dashboard",
        description: "Create the dashboard layout and summary cards.",
        assignedTo: nethmi._id,
        createdBy: amal._id,
        status: "doing",
        priority: "high",
        deadline: new Date("2026-08-25T09:00:00.000Z"),
      },
      {
        title: "Prepare API documentation",
        description: "Document authentication and group endpoints.",
        assignedTo: kasun._id,
        createdBy: amal._id,
        status: "todo",
        priority: "medium",
        deadline: new Date("2026-08-28T09:00:00.000Z"),
      },
      {
        title: "Set up MongoDB collections",
        description: "Verify users, groups, tasks, comments and notifications data.",
        assignedTo: amal._id,
        createdBy: amal._id,
        status: "done",
        priority: "low",
        deadline: new Date("2026-08-20T09:00:00.000Z"),
      },
    ];

    const tasks = await Promise.all(
      taskDefinitions.map((task) =>
        Task.findOneAndUpdate(
          { title: task.title, group: group._id },
          { $set: { ...task, group: group._id } },
          { new: true, upsert: true, runValidators: true },
        ),
      ),
    );

    await Comment.findOneAndUpdate(
      { task: tasks[0]._id, user: amal._id, content: "Please share the first dashboard draft today." },
      { $setOnInsert: { task: tasks[0]._id, user: amal._id, content: "Please share the first dashboard draft today." } },
      { upsert: true, new: true, runValidators: true },
    );

    const notificationDefinitions = [
      {
        recipient: nethmi._id,
        type: "TASK_ASSIGNED",
        message: "You were assigned to Design the dashboard.",
        relatedTask: tasks[0]._id,
      },
      {
        recipient: kasun._id,
        type: "TASK_ASSIGNED",
        message: "You were assigned to Prepare API documentation.",
        relatedTask: tasks[1]._id,
      },
      {
        recipient: amal._id,
        type: "COMMENT_ADDED",
        message: "A comment was added to Design the dashboard.",
        relatedTask: tasks[0]._id,
      },
    ];

    await Promise.all(
      notificationDefinitions.map((notification) =>
        Notification.findOneAndUpdate(
          { recipient: notification.recipient, message: notification.message },
          { $set: { ...notification, relatedGroup: group._id, isRead: false } },
          { new: true, upsert: true, runValidators: true },
        ),
      ),
    );

    console.log("Seed complete: users, groups, tasks, comments, and notifications are ready.");
  } finally {
    await closeDB();
  }
}

seed().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  if (mongoose.connection.readyState !== 0) {
    await closeDB();
  }
  process.exit(1);
});
