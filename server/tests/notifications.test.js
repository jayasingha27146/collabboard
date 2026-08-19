process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./helpers/db");
const { registerUser } = require("./helpers/auth");

describe("Notification API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  test("fetch and mark notification as read", async () => {
    const owner = await registerUser({ email: "notify-owner@example.com" });
    const member = await registerUser({ email: "notify-member@example.com" });

    const groupResponse = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Notify Group", description: "Notification test group" });

    const groupId = groupResponse.body.data._id;

    await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set("Authorization", `Bearer ${member.token}`);

    const listResponse = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.length).toBeGreaterThanOrEqual(1);

    const notificationId = listResponse.body.data[0]._id;

    const markResponse = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(markResponse.status).toBe(200);
    expect(markResponse.body.data.isRead).toBe(true);
  });
});
