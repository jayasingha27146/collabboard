const Group = require("../models/Group");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");

const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, "User profile fetched successfully", req.user);
});

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const groupIds = await Group.find({ members: userId }).distinct("_id");

  const now = new Date();

  const [
    totalGroups,
    activeTasks,
    completedTasks,
    overdueTasks,
    upcomingTasks,
  ] = await Promise.all([
    Group.countDocuments({ members: userId }),
    Task.countDocuments({
      group: { $in: groupIds },
      status: { $ne: "done" },
    }),
    Task.countDocuments({
      group: { $in: groupIds },
      status: "done",
    }),
    Task.countDocuments({
      group: { $in: groupIds },
      status: { $ne: "done" },
      deadline: { $lt: now },
    }),
    Task.find({
      group: { $in: groupIds },
      status: { $ne: "done" },
    })
      .sort({ deadline: 1 })
      .limit(5)
      .populate("assignedTo", "name email avatar role")
      .populate("group", "name"),
  ]);

  return successResponse(res, "Dashboard fetched successfully", {
    totalGroups,
    activeTasks,
    completedTasks,
    overdueTasks,
    upcomingTasks,
  });
});

module.exports = {
  getMe,
  getDashboard,
};
