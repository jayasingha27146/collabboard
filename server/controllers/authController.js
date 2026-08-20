const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/response");

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return successResponse(res, "User registered successfully", result, 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return successResponse(res, "Login successful", result, 200);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  return successResponse(res, "Current user fetched successfully", user, 200);
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  return successResponse(res, "Profile updated successfully", user, 200);
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  return successResponse(res, "Password updated successfully", null, 200);
});

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
};
