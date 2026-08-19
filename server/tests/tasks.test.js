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
        deadline: "2026-08-25T10:00:00.000Z",
      });

    expect(createTaskResponse.status).toBe(201);

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

    const conflictResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        status: "done",
        version: createTaskResponse.body.data.__v,
      });

    expect(conflictResponse.status).toBe(409);

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(deleteResponse.status).toBe(200);
  });
});
