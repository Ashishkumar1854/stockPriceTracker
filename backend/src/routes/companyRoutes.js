//backend/src/routes/companyRoutes.js

import express from "express";
import {
  listCompanies,
  createCompany,
} from "../controllers/companyController.js";
import {
  authMiddleware /*, requireAdmin*/,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: list companies
router.get("/", listCompanies);

// Protected: create company
// For now: any logged-in user; later switch to [authMiddleware, requireAdmin]
router.post("/", authMiddleware, createCompany);

export default router;
