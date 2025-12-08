// backend/src/jobs/alertEngine.js
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import YahooFinance from "yahoo-finance2";

const prisma = new PrismaClient();
const yahooFinance = new YahooFinance();

// 3% move threshold (0.03 = 3%)
const PRICE_MOVE_THRESHOLD = 0.03;

// CRON interval config (env se override ho sakta hai)
const ALERT_CRON = process.env.ALERT_CRON || "*/5 * * * *";

// ------- Helper: ticker -> Yahoo symbol mapping (MVP) -------
function mapTickerToSymbol(ticker, exchange) {
  if (!ticker) return null;

  const upper = ticker.toUpperCase();
  const exch = (exchange || "").toUpperCase();

  // India NSE common mapping
  if (exch.includes("NSE") || exch === "NSE") {
    return `${upper}.NS`;
  }

  // BSE (optional)
  if (exch.includes("BSE") || exch === "BSE") {
    return `${upper}.BO`;
  }

  // fallback: as-is
  return upper;
}

// ------- Single scan run -------
async function scanOnce() {
  console.log("[AlertEngine] Running price-move scan...");

  try {
    // Get all watchlist entries with user + company
    const watchlistItems = await prisma.watchlist.findMany({
      include: {
        user: true,
        company: true,
      },
    });

    if (!watchlistItems.length) {
      console.log("[AlertEngine] No watchlist items, skipping.");
      return;
    }

    for (const item of watchlistItems) {
      const { user, company } = item;
      if (!user || !company) continue;

      const symbol = mapTickerToSymbol(company.ticker, company.exchange);
      if (!symbol) {
        console.log(
          `[AlertEngine] Could not map ticker ${company.ticker} (${company.exchange})`
        );
        continue;
      }

      try {
        const quote = await yahooFinance.quote(symbol);

        const last = quote.regularMarketPrice;
        const prev = quote.regularMarketPreviousClose;

        if (!last || !prev) {
          console.log(
            `[AlertEngine] Missing price data for ${symbol} (last/prev null)`
          );
          continue;
        }

        const changePct = (last - prev) / prev;

        // Ignore small moves
        if (Math.abs(changePct) < PRICE_MOVE_THRESHOLD) {
          continue;
        }

        const direction = changePct > 0 ? "up" : "down";
        const changePctDisplay = (changePct * 100).toFixed(1);

        const message =
          direction === "up"
            ? `${company.ticker} moved up ${changePctDisplay}% today.`
            : `${company.ticker} dropped ${changePctDisplay}% today.`;

        // Create alert in DB
        const alert = await prisma.alert.create({
          data: {
            userId: user.id,
            companyId: company.id,
            type: "price_move",
            message,
          },
        });

        console.log(
          `[AlertEngine] Created price alert for user ${user.id} / ${company.ticker}: ${message}`
        );

        // 🔴 Real-time push via WebSocket (if available)
        const io = global._io;
        if (io) {
          io.to(`user:${user.id}`).emit("alert:new", {
            id: alert.id,
            type: alert.type,
            message: alert.message,
            createdAt: alert.createdAt,
            seen: alert.seen,
            companyId: alert.companyId,
          });
          console.log(`📡 WebSocket alert sent → user:${user.id}`);
        }
      } catch (err) {
        console.error(
          `[AlertEngine] Error fetching price for ${symbol}:`,
          err.message || err
        );
      }
    }

    console.log("[AlertEngine] Scan finished.");
  } catch (err) {
    console.error("[AlertEngine] Job failed:", err);
  }
}

// ------- Starter (used from jobs/index.js) -------
export const startAlertEngine = () => {
  console.log("[AlertEngine] Scheduling cron job:", ALERT_CRON);

  cron.schedule(ALERT_CRON, async () => {
    await scanOnce();
  });

  // Dev ke liye chaaho to ek baar startup pe bhi chala sakte ho:
  // await scanOnce();
};
