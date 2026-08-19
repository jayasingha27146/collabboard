const env = require("../config/env");

function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  void next;

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value detected";
  }

  const payload = {
    success: false,
    message,
  };

  if (env.nodeEnv !== "production") {
    payload.debug = err.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
