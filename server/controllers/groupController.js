const mongoose = require("mongoose");
const groupService = require("../services/groupService");
const notificationService = require("../services/notificationService");
const { emitToGroup } = require("../services/realtimeService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");

const getGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getUserGroups(
    req.user._id,
    req.query.search,
  );
  return successResponse(res, "Groups fetched successfully", groups);
});

const createGroup = asyncHandler(async (req, res) => {
  const group = await groupService.createGroup(req.body, req.user._id);
  return successResponse(res, "Group created successfully", group, 201);
});

const getGroup = asyncHandler(async (req, res) => {
  const result = await groupService.getGroupDetails(
    req.params.groupId,
    req.user._id,
  );
  return successResponse(res, "Group details fetched successfully", result);
});

const getGroupActivity = asyncHandler(async (req, res) => {
  const activity = await notificationService.getGroupActivity(
    req.params.groupId,
    req.user._id,
  );
  return successResponse(res, "Group activity fetched successfully", activity);
});

const updateGroup = asyncHandler(async (req, res) => {
  const group = await groupService.updateGroup(
    req.params.groupId,
    req.user._id,
    req.body,
  );
  return successResponse(res, "Group updated successfully", group);
});

const deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.params.groupId, req.user._id);
  return successResponse(res, "Group deleted successfully", null);
});

const joinGroup = asyncHandler(async (req, res) => {
  const group = await groupService.joinGroup(req.params.groupId, req.user._id);

  await notificationService.createNotification({
    recipient: group.owner,
    type: "GROUP_JOINED",
    message: "A new member joined your study group.",
    relatedGroup: group._id,
  });

  emitToGroup(String(group._id), "group:memberJoined", {
    groupId: String(group._id),
    userId: String(req.user._id),
  });

  return successResponse(res, "Joined group successfully", group);
});

const addMember = asyncHandler(async (req, res) => {
  const { group, user } = await groupService.addMemberByEmail(
    req.params.groupId,
    req.user._id,
    req.body.email,
  );

  await notificationService.createNotification({
    recipient: user._id,
    type: "GROUP_JOINED",
    message: `You were added to ${group.name}.`,
    relatedGroup: group._id,
  });

  return successResponse(res, "Member added successfully", group);
});

const removeMember = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid userId",
    });
  }

  const group = await groupService.removeMember(
    req.params.groupId,
    req.user._id,
    req.params.userId,
  );

  return successResponse(res, "Member removed successfully", group);
});

module.exports = {
  getGroups,
  createGroup,
  getGroup,
  getGroupActivity,
  updateGroup,
  deleteGroup,
  joinGroup,
  addMember,
  removeMember,
};
