// backend/src/routes/alertRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getAlerts,
  markSeen,
  createTestAlert,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", authMiddleware, getAlerts);
router.post("/test", authMiddleware, createTestAlert);
router.put("/:id/seen", authMiddleware, markSeen);

export default router;
