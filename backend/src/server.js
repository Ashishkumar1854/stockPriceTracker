// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/authRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// IMPORTANT: set in .env -> FRONTEND_URL=http://localhost:5173 (for Vite)
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || 8000;

// ---------- HTTP + SOCKET.IO SERVER ----------
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Expose io instance to routes/controllers via req.app.get("io")
app.set("io", io);

// Handle socket connections
io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  // For now: client bhejega { userId } via auth
  const { userId } = socket.handshake.auth || {};
  if (userId) {
    const room = `user:${userId}`;
    socket.join(room);
    console.log(`👤 Socket ${socket.id} joined room ${room}`);
  }

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ---------- MIDDLEWARE ----------
app.use(helmet());

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(cookieParser());
app.use(express.json());

// Simple request logger (dev)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// ---------- ROUTES ----------
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend running!" });
});

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

app.use("/auth", authRoutes);
app.use("/price", priceRoutes);
app.use("/analysis", analysisRoutes);
app.use("/companies", companyRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/alerts", alertRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ---------- SHUTDOWN ----------
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

// Start HTTP + WebSocket server
server.listen(PORT, () => {
  console.log(
    `🚀 Server + WebSocket running on port ${PORT} (CORS origin: ${FRONTEND_ORIGIN})`
  );
});
