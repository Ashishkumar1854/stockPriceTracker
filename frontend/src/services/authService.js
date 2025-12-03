// frontend/src/services/authService.js
import api from "./api";

export const signup = async ({ name, email, password }) => {
  const res = await api.post("/auth/signup", { name, email, password });
  return res.data;
};

export const login = async ({ email, password }) => {
  const res = await api.post("/auth/login", { email, password });
  // accessToken in res.data.accessToken
  return res.data;
};

export const me = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const refreshToken = async () => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};
