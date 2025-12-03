// backend/src/services/nlpClient.js
import axios from "axios";

const NLP_BASE_URL = process.env.NLP_SERVICE_URL || "http://localhost:8001";

const client = axios.create({
  baseURL: NLP_BASE_URL,
  timeout: 10000,
});

/**
 * Call FastAPI /nlp/scrape-and-analyze
 * @param {string} company - company name or ticker
 * @param {number} limit  - how many articles
 */
export const scrapeAndAnalyze = async (company, limit = 5) => {
  const res = await client.get("/nlp/scrape-and-analyze", {
    params: { company, limit },
  });
  return res.data;
};
