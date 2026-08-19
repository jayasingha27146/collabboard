import api from "./api.js";

export async function getTasks(params = {}) {
  const response = await api.get("/tasks", { params });
  return response.data;
}

export async function createTask(payload) {
  const { groupId, ...task } = payload;
  const response = await api.post(`/groups/${groupId}/tasks`, task);
  return response.data;
}

export async function getGroupTasks(groupId, params = {}) {
  const response = await api.get(`/groups/${groupId}/tasks`, { params });
  return response.data;
}

export async function updateTask(taskId, payload) {
  const response = await api.put(`/tasks/${taskId}`, payload);
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}

export async function getTaskById(taskId) {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

export async function addTaskComment(taskId, payload) {
  const response = await api.post(`/tasks/${taskId}/comments`, payload);
  return response.data;
}
