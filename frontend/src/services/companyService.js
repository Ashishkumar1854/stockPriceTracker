// frontend/src/services/companyService.js
import api from "./api";

// Create or ensure a company exists
export const createCompany = async ({ ticker, name, exchange }) => {
  const res = await api.post("/companies", { ticker, name, exchange });
  return res.data.company;
};

// Get all companies (optional admin / listing)
export const getCompanies = async () => {
  const res = await api.get("/companies");
  return res.data.companies;
};

// Add a company to current user's watchlist
export const addToWatchlist = async (companyId) => {
  const res = await api.post("/watchlist", { companyId });
  return res.data.item;
};

// Get current user's watchlist
export const getWatchlist = async () => {
  const res = await api.get("/watchlist");
  return res.data.items; // [{ id, companyId, company: {...} }]
};
