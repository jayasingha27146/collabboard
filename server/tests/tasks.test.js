process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./helpers/db");
const { registerUser } = require("./helpers/auth");

describe("Task API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  test("create, update and delete task", async () => {
    const owner = await registerUser({ email: "taskowner@example.com" });

    const groupResponse = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Task Group",
        description: "Task flow",
      });

    const groupId = groupResponse.body.data._id;

    const createTaskResponse = await request(app)
      .post(`/api/groups/${groupId}/tasks`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Database Design",
        description: "Design Mongo collections",
        assignedTo: owner.user.id,
        priority: "high",
        status: "todo",
        deadline: "2026-08-25T10:00:00.000Z",
      });

    expect(createTaskResponse.status).toBe(201);
    expect(createTaskResponse.body.data.status).toBe("todo");

    const taskId = createTaskResponse.body.data._id;

    const updateTaskResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        title: "Database Design Updated",
        status: "doing",
        version: createTaskResponse.body.data.__v,
      });

    expect(updateTaskResponse.status).toBe(200);
    expect(updateTaskResponse.body.data.status).toBe("doing");

    const activeDashboardResponse = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(activeDashboardResponse.body.data.upcomingTasks).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: taskId })]),
    );

    const conflictResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        status: "done",
        version: createTaskResponse.body.data.__v,
      });

    expect(conflictResponse.status).toBe(409);

    const completeTaskResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        status: "done",
        version: updateTaskResponse.body.data.__v,
      });

    expect(completeTaskResponse.status).toBe(200);

    const completedDashboardResponse = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(completedDashboardResponse.body.data.activeTasks).toBe(
      activeDashboardResponse.body.data.activeTasks - 1,
    );
    expect(completedDashboardResponse.body.data.completedTasks).toBe(
      activeDashboardResponse.body.data.completedTasks + 1,
    );
    expect(completedDashboardResponse.body.data.upcomingTasks).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: taskId })]),
    );

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(deleteResponse.status).toBe(200);
  });
});
