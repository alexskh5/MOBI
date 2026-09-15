import axios from "axios";
import {
  API_BASE_URL,
} from "./apiBase";
import {
  getStoredAuthUser,
} from "./auth";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const user = getStoredAuthUser();

  if (user?.accessToken) {
    config.headers.Authorization =
      `Bearer ${user.accessToken}`;
  }

  if (user?.centerId) {
    config.headers["x-center-id"] =
      user.centerId;
  }

  if (user?.actorId) {
    config.headers["x-actor-id"] =
      user.actorId;
  }

  if (user?.role) {
    config.headers["x-actor-role"] =
      user.role;
  }

  return config;
});
