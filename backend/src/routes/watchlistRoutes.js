//backend/src/routes/watchlistRoutes.js

import express from "express";
import {
  getMyWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyWatchlist);
router.post("/", authMiddleware, addToWatchlist);
router.delete("/:companyId", authMiddleware, removeFromWatchlist);

export default router;
