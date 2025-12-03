// backend/src/controllers/analysisController.js
import { PrismaClient } from "@prisma/client";
import { scrapeAndAnalyze } from "../services/nlpClient.js";

const prisma = new PrismaClient();

/**
 * GET /analysis/:company
 * company can be ticker or name string (like TCS, INFY, "Tata Motors")
 */
export const analyzeByCompanyString = async (req, res) => {
  try {
    const company = req.params.company;
    const { limit } = req.query;

    if (!company) {
      return res.status(400).json({ error: "company param required" });
    }

    const data = await scrapeAndAnalyze(company, Number(limit) || 5);
    return res.json(data);
  } catch (err) {
    console.error("analyzeByCompanyString error:", err.message);
    return res.status(500).json({ error: "Failed to analyze company news" });
  }
};

/**
 * GET /analysis/company/:id
 * Uses DB company name/ticker, then sends to NLP.
 */
export const analyzeByCompanyId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid company id" });
    }

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const q = company.ticker || company.name;
    const data = await scrapeAndAnalyze(q, 5);

    return res.json({
      company: {
        id: company.id,
        ticker: company.ticker,
        name: company.name,
        exchange: company.exchange,
      },
      ...data,
    });
  } catch (err) {
    console.error("analyzeByCompanyId error:", err.message);
    return res.status(500).json({ error: "Failed to analyze company by id" });
  }
};
