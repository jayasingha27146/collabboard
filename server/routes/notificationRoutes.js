const express = require("express");
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.get("/unread-count", notificationController.unreadCount);
router.patch(
  "/:notificationId/read",
  validateObjectId("notificationId"),
  notificationController.markAsRead,
);

module.exports = router;
