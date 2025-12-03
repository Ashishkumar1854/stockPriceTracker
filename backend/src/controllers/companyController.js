import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /companies
export const listCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { ticker: "asc" },
      select: {
        id: true,
        ticker: true,
        name: true,
        exchange: true,
        sector: true,
        industry: true,
        createdAt: true,
      },
    });
    res.json({ companies });
  } catch (err) {
    console.error("listCompanies error:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

// POST /companies  (admin later; for now any logged-in user or only admin)
export const createCompany = async (req, res) => {
  try {
    const { ticker, name, exchange, sector, industry } = req.body;

    if (!ticker || !name) {
      return res
        .status(400)
        .json({ error: "ticker and name are required fields" });
    }

    const exists = await prisma.company.findUnique({ where: { ticker } });
    if (exists) {
      return res.status(400).json({ error: "Company with this ticker exists" });
    }

    const company = await prisma.company.create({
      data: {
        ticker: ticker.toUpperCase(),
        name,
        exchange,
        sector,
        industry,
      },
      select: {
        id: true,
        ticker: true,
        name: true,
        exchange: true,
        sector: true,
        industry: true,
        createdAt: true,
      },
    });

    res.status(201).json({ company });
  } catch (err) {
    console.error("createCompany error:", err);
    res.status(500).json({ error: "Failed to create company" });
  }
};
