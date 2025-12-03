// frontend/src/services/analysisService.js
import api from "./api";

// GET /analysis/company/id/:id
export const getCompanyAnalysisById = async (companyId) => {
  const res = await api.get(`/analysis/company/id/${companyId}`);
  return res.data;
};

// OPTIONAL: GET /analysis/:symbol (TCS, INFY, etc)
export const getAnalysisBySymbol = async (symbol, params = {}) => {
  const res = await api.get(`/analysis/${symbol}`, { params });
  return res.data;
};
