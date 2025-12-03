// backend/src/utils/redisClient.js
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  // if password needed:
  // password: process.env.REDIS_PASSWORD || undefined,
});

export default redis;
