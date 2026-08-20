import api from "./api.js";

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function register(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function getProfile() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function changePassword(payload) {
  const response = await api.put("/auth/change-password", payload);
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.put("/auth/profile", payload);
  return response.data;
}
