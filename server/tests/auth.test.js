process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

const request = require("supertest");
const app = require("../app");
const { connectTestDB, clearTestDB, closeTestDB } = require("./helpers/db");

describe("Auth API", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  test("register user successfully", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe("john@example.com");
    expect(response.body.data.token).toBeTruthy();
  });

  test("login user successfully", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
  });

  test("reject invalid login", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nouser@example.com",
      password: "wrong123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("updates the authenticated user's profile", async () => {
    const registration = await request(app).post("/api/auth/register").send({
      name: "Profile User",
      email: "profile@example.com",
      password: "password123",
      role: "group_leader",
    });

    const response = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${registration.body.data.token}`)
      .send({ fullName: "Updated User", email: "updated@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Updated User");
    expect(response.body.data.email).toBe("updated@example.com");
  });

  test("registers a team member without creating a starter group", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Team Member",
      email: "member@example.com",
      password: "password123",
      role: "team_member",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe("team_member");

    const groupsResponse = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${response.body.data.token}`);
    expect(groupsResponse.body.data).toHaveLength(0);
  });

  test("changes the authenticated user's password", async () => {
    const registration = await request(app).post("/api/auth/register").send({
      name: "Password User",
      email: "password@example.com",
      password: "password123",
    });

    const response = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${registration.body.data.token}`)
      .send({ currentPassword: "password123", newPassword: "newpassword123" });

    expect(response.status).toBe(200);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "password@example.com",
      password: "newpassword123",
    });
    expect(loginResponse.status).toBe(200);
  });
});
