//backend/src/controllers/alertController.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// FETCH user alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json({ alerts });
  } catch (err) {
    console.error("getAlerts error:", err);
    return res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// MARK alert as seen
export const markSeen = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await prisma.alert.update({
      where: { id },
      data: { seen: true },
    });

    return res.json({ alert: updated });
  } catch (err) {
    console.error("markSeen error:", err);
    return res.status(500).json({ error: "Failed to mark alert as seen" });
  }
};

// DEV: create test alert
export const createTestAlert = async (req, res) => {
  try {
    const alert = await prisma.alert.create({
      data: {
        userId: req.user.id,
        type: "test_alert",
        message: "This is a test alert for your account!",
      },
    });

    return res.json({ alert });
  } catch (err) {
    console.error("createTestAlert error:", err);
    return res.status(500).json({ error: "Failed to create alert" });
  }
};
