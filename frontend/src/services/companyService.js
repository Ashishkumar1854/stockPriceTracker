// frontend/src/services/companyService.js

import api from "./api";

export const fetchCompanies = async () => {
  const res = await api.get("/companies");
  return res.data;
};

export const fetchMyWatchlist = async () => {
  const res = await api.get("/watchlist");
  return res.data;
};

export const addWatchlistItem = async (companyId) => {
  const res = await api.post("/watchlist", { companyId });
  return res.data;
};

export const removeWatchlistItem = async (companyId) => {
  const res = await api.delete(`/watchlist/${companyId}`);
  return res.data;
};
