const ApiError = require("../utils/ApiError");

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError("Forbidden", 403);
    }
    next();
  };
}

module.exports = {
  allowRoles,
};
