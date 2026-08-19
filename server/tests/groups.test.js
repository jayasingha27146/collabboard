process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./helpers/db");
const { registerUser } = require("./helpers/auth");

describe("Group API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  test("create group and list groups", async () => {
    const owner = await registerUser({ email: "owner@example.com" });

    const createResponse = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Software Engineering Group",
        description: "Final year project study group",
      });

    expect(createResponse.status).toBe(201);

    const listResponse = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.length).toBe(2);
  });

  test("block unrelated user from accessing private group", async () => {
    const owner = await registerUser({ email: "owner2@example.com" });
    const outsider = await registerUser({ email: "outsider@example.com" });

    const createResponse = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Private Group",
        description: "Members only",
      });

    const groupId = createResponse.body.data._id;

    const detailResponse = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${outsider.token}`);

    expect(detailResponse.status).toBe(403);
    expect(detailResponse.body.success).toBe(false);
  });
});
