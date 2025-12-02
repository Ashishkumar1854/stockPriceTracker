import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend running!" });
});

// DB test
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// AUTH ROUTES (your missing part)
app.use("/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
