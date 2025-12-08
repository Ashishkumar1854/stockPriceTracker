// frontend/src/services/alertService.js
import api from "./api";

export const fetchAlerts = async () => {
  const res = await api.get("/alerts");
  return res.data.alerts;
};

export const markAlertSeen = async (id) => {
  const res = await api.put(`/alerts/${id}/seen`);
  return res.data.alert;
};
