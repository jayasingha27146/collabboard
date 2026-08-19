import api from "./api.js";

export async function getGroups(params = {}) {
  const response = await api.get("/groups", { params });
  return response.data;
}

export async function getGroup(groupId) {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
}

export async function getGroupActivity(groupId) {
  const response = await api.get(`/groups/${groupId}/activity`);
  return response.data;
}

export async function createGroup(payload) {
  const response = await api.post("/groups", payload);
  return response.data;
}

export async function joinGroup(groupId) {
  const response = await api.post(`/groups/${groupId}/join`);
  return response.data;
}

export async function removeMember(groupId, userId) {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
}

export async function addMember(groupId, email) {
  const response = await api.post(`/groups/${groupId}/members`, { email });
  return response.data;
}
