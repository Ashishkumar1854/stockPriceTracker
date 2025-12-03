// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// IMPORTANT: set in .env -> FRONTEND_URL=http://localhost:5173 (for Vite)
// Fallback 3000 if not set
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 8000;

// Security headers
app.use(helmet());

// CORS: allow credentials for cookie-based refresh token
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// parse cookies and json
app.use(cookieParser());
app.use(express.json());

// Simple request logger (dev)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// Health
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend running!" });
});

// DB test (remove or protect in prod)
app.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
        role: true,
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Auth routes
app.use("/auth", authRoutes);

// Company routes
app.use("/companies", companyRoutes);

// Watchlist routes
app.use("/watchlist", watchlistRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error("Error disconnecting Prisma:", e);
  }
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} (CORS origin: ${FRONTEND_ORIGIN})`
  );
});
