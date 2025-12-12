// backend/src/jobs/alertEngine.js
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import YahooFinance from "yahoo-finance2";

const prisma = new PrismaClient();
const yahooFinance = new YahooFinance();

// 3% move threshold (0.03 = 3%)
const PRICE_MOVE_THRESHOLD = Number(process.env.PRICE_MOVE_THRESHOLD) || 0.03;

// CRON interval config (env override)
const ALERT_CRON = process.env.ALERT_CRON || "*/15 * * * *";

// Dedupe window in minutes (don't create same price_move alert repeatedly)
// default: 360 minutes = 6 hours
const ALERT_DEDUPE_MINUTES = Number(process.env.ALERT_DEDUPE_MINUTES) || 360;

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

    const dedupeSince = new Date(Date.now() - ALERT_DEDUPE_MINUTES * 60 * 1000);

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

        if (last == null || prev == null) {
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

        // Dedupe: skip if a similar recent alert exists for this user/company/type
        const recent = await prisma.alert.findFirst({
          where: {
            userId: user.id,
            companyId: company.id,
            type: "price_move",
            createdAt: { gte: dedupeSince },
            // optionally: message contains same direction or text - but createdAt check should suffice
          },
          orderBy: { createdAt: "desc" },
        });

        if (recent) {
          console.log(
            `[AlertEngine] skipping duplicate alert for ${company.ticker} (recent exists id=${recent.id})`
          );
          continue;
        }

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
          err?.message || err
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

  // Dev: if you want one immediate run at startup, uncomment below:
  // (async () => { await scanOnce(); })();
};
