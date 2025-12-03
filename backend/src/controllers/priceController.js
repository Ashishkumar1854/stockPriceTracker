// backend/src/controllers/priceController.js
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance(); // v3 style instance

// Helper: range ko days me convert kare
const getDaysFromRange = (range) => {
  switch (range) {
    case "5d":
      return 5;
    case "1mo":
      return 30;
    case "3mo":
      return 90;
    case "6mo":
      return 180;
    case "1y":
      return 365;
    default:
      return 30; // default 1 month
  }
};

export const getPriceHistory = async (req, res) => {
  try {
    const symbol = req.params.symbol || req.params.ticker; // /price/:symbol/history
    const { range = "1mo", interval = "1d" } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const days = getDaysFromRange(range);

    const period2 = new Date(); // today
    const period1 = new Date();
    period1.setDate(period1.getDate() - days);

    // IMPORTANT: v3 now expects { period1, period2, interval }
    const result = await yahooFinance.chart(symbol, {
      period1,
      period2,
      interval,
      includePrePost: false,
    });

    if (!result?.quotes?.length) {
      return res
        .status(404)
        .json({ error: "No price data found for this symbol" });
    }

    const prices = result.quotes.map((q) => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));

    return res.json({
      symbol,
      range,
      interval,
      prices,
    });
  } catch (err) {
    console.error("Price history error:", err);
    return res.status(500).json({
      error: "Failed to fetch price history for this symbol",
    });
  }
};
