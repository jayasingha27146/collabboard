const User = require("../models/User");
const Group = require("../models/Group");
const Task = require("../models/Task");
const notificationService = require("./notificationService");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function registerUser({ fullName, name, email, password }) {
  const displayName = (fullName || name || "").trim();
  if (!displayName) {
    throw new ApiError("Full name is required", 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError("Email already in use", 409);
  }

  const user = await User.create({
    name: displayName,
    email,
    password,
    role: "student",
  });

  const group = await Group.create({
    name: `${user.name}'s Study Board`,
    description: "Your private workspace for planning study tasks.",
    owner: user._id,
    members: [user._id],
  });

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);

  const starterTask = await Task.create({
    title: "Create your first study task",
    description:
      "Update or complete this starter task to begin using CollabBoard.",
    group: group._id,
    assignedTo: user._id,
    createdBy: user._id,
    status: "todo",
    priority: "medium",
    deadline,
  });

  await notificationService.createNotification({
    recipient: user._id,
    type: "TASK_ASSIGNED",
    message: "Your starter task is ready in your study board.",
    relatedTask: starterTask._id,
    relatedGroup: group._id,
  });

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id),
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    throw new ApiError("Invalid email or password", 401);
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id),
  };
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
