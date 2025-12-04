// backend/src/controllers/alertController.js
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
    const { companyId } = req.body || {};

    const alert = await prisma.alert.create({
      data: {
        userId: req.user.id,
        companyId: companyId ?? null,
        type: "test_alert",
        message: "This is a test alert for your account!",
      },
    });

    // 🔔 Emit real-time alert over WebSocket
    const io = req.app.get("io");
    if (io) {
      const room = `user:${req.user.id}`;
      io.to(room).emit("alert:new", {
        id: alert.id,
        type: alert.type,
        message: alert.message,
        createdAt: alert.createdAt,
        seen: alert.seen,
      });
      console.log(`📡 Emitted alert:new to room ${room}`);
    }

    return res.json({ alert });
  } catch (err) {
    console.error("createTestAlert error:", err);
    return res.status(500).json({ error: "Failed to create alert" });
  }
};
