// backend/src/routes/authRoutes.js
import express from "express";
import {
  signup,
  login,
  me,
  refresh,
  logout,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// refresh access token via refresh cookie
router.post("/refresh", refresh);

// logout & revoke refresh token
router.post("/logout", logout);

// get current user (requires access token)
router.get("/me", authMiddleware, me);

export default router;
