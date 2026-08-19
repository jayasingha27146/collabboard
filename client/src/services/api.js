import axios from "axios";
import { storageKeys } from "../utils/storage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(storageKeys.authToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const safeMessage =
      error?.response?.data?.message ||
      "Something went wrong. Please try again.";

    return Promise.reject(new Error(safeMessage));
  },
);

export default api;
