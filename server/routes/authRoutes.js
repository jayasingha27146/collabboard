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

module.exports = router;
