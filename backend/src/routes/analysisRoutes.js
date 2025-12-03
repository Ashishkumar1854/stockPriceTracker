// backend/src/routes/analysisRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  analyzeByCompanyString,
  analyzeByCompanyId,
} from "../controllers/analysisController.js";

const router = express.Router();

// Protected routes – user must be logged in
router.get("/:company", authMiddleware, analyzeByCompanyString);
router.get("/company/id/:id", authMiddleware, analyzeByCompanyId);

export default router;
