const request = require("supertest");
const app = require("../../app");

async function registerUser(overrides = {}) {
  const payload = {
    name: overrides.name || "Test User",
    email: overrides.email || `user${Date.now()}@mail.com`,
    password: overrides.password || "password123",
    role: overrides.role || "group_leader",
  };

  const response = await request(app).post("/api/auth/register").send(payload);

  return {
    payload,
    response,
    token: response.body?.data?.token,
    user: response.body?.data?.user,
  };
}

module.exports = {
  registerUser,
};
