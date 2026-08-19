const express = require("express");
const taskController = require("../controllers/taskController");
const commentController = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
const {
  requireFields,
  validateObjectId,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(protect);

// Get all user's tasks from all groups
router.get("/", taskController.getAllUserTasks);

router
  .route("/:taskId")
  .get(validateObjectId("taskId"), taskController.getTask)
  .put(validateObjectId("taskId"), taskController.updateTask)
  .delete(validateObjectId("taskId"), taskController.deleteTask);

router
  .route("/:taskId/comments")
  .get(validateObjectId("taskId"), commentController.getTaskComments)
  .post(
    validateObjectId("taskId"),
    requireFields(["content"]),
    commentController.createComment,
  );

module.exports = router;
