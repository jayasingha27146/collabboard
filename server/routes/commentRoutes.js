const express = require("express");
const commentController = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
const {
  requireFields,
  validateObjectId,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/:commentId")
  .put(
    validateObjectId("commentId"),
    requireFields(["content"]),
    commentController.updateComment,
  )
  .delete(validateObjectId("commentId"), commentController.deleteComment);

module.exports = router;
