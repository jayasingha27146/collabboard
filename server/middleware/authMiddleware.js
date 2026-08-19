const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError("Authorization header required", 401);
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError("Invalid authorization format", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError("Token expired", 401);
    }
    throw new ApiError("Invalid token", 401);
  }

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
