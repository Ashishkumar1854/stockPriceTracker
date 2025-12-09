// backend/src/services/nlpClient.js
import axios from "axios";

const NLP_BASE_URL = process.env.NLP_SERVICE_URL || "http://localhost:8001";

const client = axios.create({
  baseURL: NLP_BASE_URL,
  timeout: 12000,
});

/**
 * Hit FastAPI /nlp/analyze-full
 * @param {string} company
 * @param {Array} articles (optional)
 */
export const analyzeFull = async (company, articles = []) => {
  const payload = { company, articles };

  const res = await client.post("/nlp/analyze-full", payload, {
    headers: { "Content-Type": "application/json" },
  });

  return res.data; // contains prediction: { move, confidence, reason, ... }
};
