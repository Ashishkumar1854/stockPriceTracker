//backend/src/controllers/watchlistController.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /watchlist
export const getMyWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            ticker: true,
            name: true,
            exchange: true,
            sector: true,
            industry: true,
          },
        },
      },
    });

    res.json({ items });
  } catch (err) {
    console.error("getMyWatchlist error:", err);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
};

// POST /watchlist { companyId }
export const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
    });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: Number(companyId),
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Company already in watchlist" });
    }

    const item = await prisma.watchlist.create({
      data: {
        userId,
        companyId: Number(companyId),
      },
      include: {
        company: true,
      },
    });

    res.status(201).json({ item });
  } catch (err) {
    console.error("addToWatchlist error:", err);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
};

// DELETE /watchlist/:companyId
export const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = Number(req.params.companyId);

    await prisma.watchlist.delete({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    console.error("removeFromWatchlist error:", err);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
};
