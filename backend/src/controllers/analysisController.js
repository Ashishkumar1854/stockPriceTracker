// backend/src/controllers/analysisController.js
import { PrismaClient } from "@prisma/client";
import { analyzeFull } from "../services/nlpClient.js";

const prisma = new PrismaClient();

/**
 * GET /analysis/:company
 * Analyze company name/ticker directly from URL.
 * Example: /analysis/TCS
 */
export const analyzeByCompanyString = async (req, res) => {
  try {
    const company = req.params.company;
    if (!company) {
      return res.status(400).json({ error: "company param required" });
    }

    const data = await analyzeFull(company);

    return res.json({
      company: company,
      ...data, // includes: article_count, avg_compound, predicted_move, prediction, articles
    });
  } catch (err) {
    console.error("analyzeByCompanyString error:", err);
    return res.status(500).json({ error: "Failed to analyze company news" });
  }
};

/**
 * GET /analysis/company/:id
 * Fetch company from DB, then call NLP analyze-full.
 */
export const analyzeByCompanyId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid company id" });

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const queryName = company.ticker || company.name;

    // Calls NLP rule-based prediction
    const data = await analyzeFull(queryName);

    return res.json({
      company: {
        id: company.id,
        ticker: company.ticker,
        name: company.name,
        exchange: company.exchange,
      },
      ...data, // enrich NLP response into frontend
    });
  } catch (err) {
    console.error("analyzeByCompanyId error:", err);
    return res.status(500).json({ error: "Failed to analyze company by id" });
  }
};
