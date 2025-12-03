// backend/src/controllers/authController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import redis from "../utils/redisClient.js";

const prisma = new PrismaClient();

const createAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

const createRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// 🔹 Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email & password required" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, provider: "local" },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
      }, // do not return password
    });

    return res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
};

// 🔹 Login (access + refresh, Redis store)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email & password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Invalid email or password" });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    const hashed = hashToken(refreshToken);
    const ttlSeconds = 30 * 24 * 60 * 60; // 30 days

    // store hashed refresh token in Redis
    await redis.set(`refresh:${hashed}`, String(user.id), "EX", ttlSeconds);

    // httpOnly cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ttlSeconds * 1000,
    });

    return res.json({
      message: "Login success",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

// 🔹 Refresh access token using HttpOnly refresh cookie
export const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.cookies || {};
    if (!refresh_token)
      return res.status(401).json({ error: "No refresh token" });

    let payload;
    try {
      payload = jwt.verify(refresh_token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    const hashed = hashToken(refresh_token);
    const storedUserId = await redis.get(`refresh:${hashed}`);

    if (!storedUserId) {
      return res.status(401).json({ error: "Refresh token revoked" });
    }

    // Token rotation: delete old
    await redis.del(`refresh:${hashed}`);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    const newHashed = hashToken(newRefreshToken);
    const ttlSeconds = 30 * 24 * 60 * 60;

    await redis.set(`refresh:${newHashed}`, String(user.id), "EX", ttlSeconds);

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ttlSeconds * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ error: "Could not refresh token" });
  }
};

// 🔹 Logout (invalidate refresh token)
export const logout = async (req, res) => {
  try {
    const { refresh_token } = req.cookies || {};

    if (refresh_token) {
      const hashed = hashToken(refresh_token);
      await redis.del(`refresh:${hashed}`);
    }

    res.clearCookie("refresh_token", { path: "/" });

    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Logout failed" });
  }
};

// 🔹 Me (protected)
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};
