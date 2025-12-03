// backend/src/controllers/priceController.js
import yahooFinance from "yahoo-finance2";

export const getPriceHistory = async (req, res) => {
  const ticker = req.params.ticker; // e.g. TCS.NS
  const range = req.query.range || "1mo";
  const interval = req.query.interval || "1d";

  try {
    const result = await yahooFinance.chart(ticker, {
      range,
      interval,
    });

    const quotes = result?.quotes || [];

    const prices = quotes.map((q) => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));

    const latest = prices[prices.length - 1] || null;

    return res.json({
      ticker,
      range,
      interval,
      latestPrice: latest?.close ?? null,
      prices,
    });
  } catch (err) {
    console.error("Price history error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch price history for this symbol" });
  }
};
