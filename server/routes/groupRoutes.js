const express = require("express");

const groupController = require("../controllers/groupController");
const taskController = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const {
  requireFields,
  validateObjectId,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Protect all group routes
router.use(protect);

// GET /api/groups
// POST /api/groups
router
  .route("/")
  .get(groupController.getGroups)
  .post(requireFields(["name", "description"]), groupController.createGroup);

// POST /api/groups/:groupId/join
router.post(
  "/:groupId/join",
  validateObjectId("groupId"),
  groupController.joinGroup,
);

router.post(
  "/:groupId/members",
  validateObjectId("groupId"),
  requireFields(["email"]),
  groupController.addMember,
);

// DELETE /api/groups/:groupId/members/:userId
router.delete(
  "/:groupId/members/:userId",
  validateObjectId("groupId"),
  validateObjectId("userId"),
  groupController.removeMember,
);

// GET /api/groups/:groupId/tasks
// POST /api/groups/:groupId/tasks
router
  .route("/:groupId/tasks")
  .get(validateObjectId("groupId"), taskController.getGroupTasks)
  .post(
    validateObjectId("groupId"),
    requireFields(["title", "assignedTo", "priority", "deadline"]),
    taskController.createTask,
  );

router.get(
  "/:groupId/activity",
  validateObjectId("groupId"),
  groupController.getGroupActivity,
);

// GET /api/groups/:groupId
// PUT /api/groups/:groupId
// DELETE /api/groups/:groupId
router
  .route("/:groupId")
  .get(validateObjectId("groupId"), groupController.getGroup)
  .put(
    validateObjectId("groupId"),
    requireFields(["name", "description"]),
    groupController.updateGroup,
  )
  .delete(validateObjectId("groupId"), groupController.deleteGroup);

module.exports = router;
