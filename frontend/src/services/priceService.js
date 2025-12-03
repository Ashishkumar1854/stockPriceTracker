// frontend/src/services/priceService.js
import api from "./api";

export const getPriceHistory = async (
  symbol,
  range = "1mo",
  interval = "1d"
) => {
  const res = await api.get(`/price/${symbol}/history`, {
    params: { range, interval },
  });
  return res.data;
};
