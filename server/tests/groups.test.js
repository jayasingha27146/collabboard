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

  test("blocks a team member from creating a group", async () => {
    const member = await registerUser({
      email: "member-only@example.com",
      role: "team_member",
    });

    const response = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${member.token}`)
      .send({ name: "Blocked Group", description: "Not allowed" });

    expect(response.status).toBe(403);
  });

  test("allows only the group leader to add and remove members", async () => {
    const leader = await registerUser({ email: "manage-leader@example.com" });
    const member = await registerUser({
      email: "managed-member@example.com",
      role: "team_member",
    });
    const groupResponse = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${leader.token}`)
      .send({ name: "Managed Team", description: "Member management" });
    const groupId = groupResponse.body.data._id;

    const addResponse = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set("Authorization", `Bearer ${leader.token}`)
      .send({ email: member.payload.email });
    expect(addResponse.status).toBe(200);
    expect(addResponse.body.data.user.email).toBe(member.payload.email);

    const forbiddenRemove = await request(app)
      .delete(`/api/groups/${groupId}/members/${leader.user.id}`)
      .set("Authorization", `Bearer ${member.token}`);
    expect(forbiddenRemove.status).toBe(403);

    const removeResponse = await request(app)
      .delete(`/api/groups/${groupId}/members/${member.user.id}`)
      .set("Authorization", `Bearer ${leader.token}`);
    expect(removeResponse.status).toBe(200);
  });
});
