const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { requireFields } = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/register",
  requireFields(["email", "password"]),
  authController.register,
);
router.post(
  "/login",
  requireFields(["email", "password"]),
  authController.login,
);
router.get("/me", protect, authController.me);
router.put(
  "/profile",
  protect,
  requireFields(["fullName", "email"]),
  authController.updateProfile,
);
router.put(
  "/change-password",
  protect,
  requireFields(["currentPassword", "newPassword"]),
  authController.changePassword,
);

module.exports = router;
