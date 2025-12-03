// backend/src/routes/priceRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getPriceHistory } from "../controllers/priceController.js";

const router = express.Router();

// GET /price/:ticker/history?range=1mo&interval=1d
router.get("/:ticker/history", authMiddleware, getPriceHistory);

export default router;
