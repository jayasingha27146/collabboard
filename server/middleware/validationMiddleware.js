const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return (
        value === undefined || value === null || String(value).trim() === ""
      );
    });

    if (missing.length > 0) {
      throw new ApiError(`Missing required fields: ${missing.join(", ")}`, 400);
    }

    next();
  };
}

function validateObjectId(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new ApiError(`Invalid ${paramName}`, 400);
    }
    next();
  };
}

module.exports = {
  requireFields,
  validateObjectId,
};
