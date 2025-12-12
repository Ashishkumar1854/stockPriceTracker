// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getCompanyAnalysisById } from "../services/analysisService";
import {
  getWatchlist,
  addToWatchlist,
  createCompany,
} from "../services/companyService";
import { getPriceHistory } from "../services/priceService";
import PriceChart from "../components/dashboard/PriceChart";
import NotificationBell from "../components/ui/NotificationBell";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");

  // Price states
  const [priceData, setPriceData] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState("");

  // For future: quick add company (MVP hardcoded TCS / form later)
  const [adding, setAdding] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Load watchlist on mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoadingWatchlist(true);
      setWatchlistError("");
      try {
        const items = await getWatchlist();
        setWatchlist(items || []);

        if (items && items.length > 0) {
          // auto select first company
          setSelectedCompany(items[0].company);
        }
      } catch (err) {
        console.error("Failed to load watchlist:", err);
        setWatchlistError(
          err?.response?.data?.error || "Failed to load watchlist"
        );
      } finally {
        setLoadingWatchlist(false);
      }
    };

    fetchWatchlist();
  }, []);

  // Load analysis whenever selectedCompany changes
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCompany?.id) return;
      setLoadingAnalysis(true);
      setAnalysisError("");
      try {
        const data = await getCompanyAnalysisById(selectedCompany.id);
        setAnalysis(data);
      } catch (err) {
        console.error("Failed to load analysis:", err);
        setAnalysisError(
          err?.response?.data?.error || "Failed to load sentiment data"
        );
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [selectedCompany]);

  // Load price history whenever selectedCompany changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedCompany?.ticker) {
        setPriceData(null);
        return;
      }
      setLoadingPrice(true);
      setPriceError("");
      try {
        let symbol = selectedCompany.ticker;

        // Simple mapping for demo: TCS -> TCS.NS
        if (symbol === "TCS") {
          symbol = "TCS.NS";
        }

        const data = await getPriceHistory(symbol, "1mo", "1d");
        setPriceData(data);
      } catch (err) {
        console.error("Failed to load price:", err);
        setPriceError(
          err?.response?.data?.error || "Failed to load price history"
        );
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [selectedCompany]);

  // Helper: sentiment color based on predicted move
  const sentimentColor =
    analysis?.predicted_move === "up"
      ? "text-green-600"
      : analysis?.predicted_move === "down"
      ? "text-red-600"
      : "text-slate-700";

  const sentimentBg =
    analysis?.predicted_move === "up"
      ? "bg-green-50 border-green-200"
      : analysis?.predicted_move === "down"
      ? "bg-red-50 border-red-200"
      : "bg-slate-50 border-slate-200";

  // MVP: add hardcoded TCS to watchlist (for demo)
  const handleAddTcsToWatchlist = async () => {
    setAdding(true);
    try {
      // create company if not exists (backend handles unique ticker)
      const company = await createCompany({
        ticker: "TCS",
        name: "Tata Consultancy Services",
        exchange: "NSE",
      });

      await addToWatchlist(company.id);

      // reload watchlist
      const items = await getWatchlist();
      setWatchlist(items || []);
      if (items && items.length > 0) {
        const tcsItem = items.find((i) => i.company.ticker === "TCS");
        if (tcsItem) setSelectedCompany(tcsItem.company);
      }
    } catch (err) {
      console.error("Failed to add TCS:", err);
      alert(err?.response?.data?.error || "Failed to add TCS to watchlist");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              AshishStockTracker
            </h1>
            <p className="text-xs text-slate-500">
              Emotion + News based stock insight (MVP)
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            )}

            {/* Notifications bell */}
            <NotificationBell />

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Left: Welcome + summary */}
          <section className="md:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Welcome{user?.name ? `, ${user.name}` : ""} 👋
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              This is your personal dashboard. you&apos;ll see:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Your watchlist companies</li>
              <li>Latest news sentiment per company</li>
              <li>Price movement prediction (up / down / neutral)</li>
              <li>Alert for high-risk negative news</li>
            </ul>
          </section>

          {/* Right: quick user card */}
          <aside className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Account
            </h3>
            {user ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium text-slate-700">Name: </span>
                  {user.name || "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Email: </span>
                  {user.email}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Provider: </span>
                  {user.provider || "local"}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No user info loaded. Try logging in again.
              </p>
            )}
          </aside>
        </div>

        {/* Watchlist + Sentiment + Price */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Watchlist actual */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Watchlist
              </h3>
              <button
                onClick={handleAddTcsToWatchlist}
                disabled={adding}
                className="text-[11px] px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add TCS demo"}
              </button>
            </div>

            {loadingWatchlist && (
              <p className="text-xs text-slate-500">Loading watchlist...</p>
            )}

            {watchlistError && (
              <p className="text-xs text-red-600 mb-2">{watchlistError}</p>
            )}

            {!loadingWatchlist && watchlist.length === 0 && !watchlistError && (
              <p className="text-xs text-slate-500">
                No companies in your watchlist yet. Use &quot;Add TCS demo&quot;
                to add first company.
              </p>
            )}

            {watchlist.length > 0 && (
              <ul className="space-y-1">
                {watchlist.map((item) => {
                  const c = item.company;
                  const isSelected = selectedCompany?.id === c.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setSelectedCompany(c)}
                        className={`w-full text-left px-3 py-2 rounded-md text-xs border ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{c.ticker}</span>
                          <span className="text-[10px]">
                            {c.exchange || "—"}
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5 truncate">{c.name}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="mt-3 text-[11px] text-slate-400">
              Selecting a company updates the sentiment & price chart card on
              the right.
            </p>
          </div>

          {/* Sentiment & Prediction + Price Chart */}
          <div className={`rounded-xl shadow-sm p-5 border ${sentimentBg}`}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Today&apos;s Sentiment & Prediction
            </h3>

            {selectedCompany && (
              <p className="text-[11px] text-slate-500 mb-2">
                Showing analysis for{" "}
                <span className="font-semibold">
                  {selectedCompany.ticker} — {selectedCompany.name}
                </span>
              </p>
            )}

            {!selectedCompany && (
              <p className="text-xs text-slate-500 mb-2">
                Select a company from your watchlist to view sentiment & price.
              </p>
            )}

            {loadingAnalysis && selectedCompany && (
              <p className="text-xs text-slate-500">Loading sentiment...</p>
            )}

            {analysisError && (
              <p className="text-xs text-red-600 mb-2">{analysisError}</p>
            )}

            {!loadingAnalysis &&
              analysis &&
              !analysisError &&
              selectedCompany && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Company
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {analysis.company?.name ||
                          analysis.company?.ticker ||
                          analysis.company ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase">
                        Predicted move
                      </p>
                      <p className={`text-sm font-semibold ${sentimentColor}`}>
                        {analysis.predicted_move === "up"
                          ? "↑ Up"
                          : analysis.predicted_move === "down"
                          ? "↓ Down"
                          : "→ Neutral"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-slate-500">Avg sentiment (compound)</p>
                      <p className="font-semibold text-slate-800">
                        {analysis.avg_compound?.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Articles analyzed</p>
                      <p className="font-semibold text-slate-800">
                        {analysis.article_count}
                      </p>
                    </div>
                  </div>

                  {/* Optional: show prediction object (Phase 5A) */}
                  {analysis.prediction && (
                    <div className="mt-2 p-3 bg-white rounded border text-xs">
                      <p className="font-medium">
                        Signal: {analysis.prediction.move.toUpperCase()}
                      </p>
                      <p className="text-sm">
                        Confidence:{" "}
                        {(analysis.prediction.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-slate-600 mt-1">
                        {analysis.prediction.reason}
                      </p>
                    </div>
                  )}

                  {/* Articles list */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Latest news sentiment
                    </p>
                    <div className="space-y-2 max-h-40 overflow-auto pr-1">
                      {analysis.articles?.map((a, idx) => (
                        <div
                          key={idx}
                          className="border border-slate-100 rounded-md p-2 bg-white/70"
                        >
                          <p className="text-xs font-medium text-slate-800 line-clamp-2">
                            {a.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-slate-500">
                              {a.sentiment?.label?.toUpperCase()} •{" "}
                              {a.sentiment?.scores?.compound?.toFixed(3)}
                            </span>
                            {a.link && (
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-indigo-600 hover:underline"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      {!analysis.articles?.length && (
                        <p className="text-[11px] text-slate-400">
                          No recent articles found.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {!loadingAnalysis &&
              !analysis &&
              !analysisError &&
              selectedCompany && (
                <p className="text-xs text-slate-500">
                  No sentiment data yet. Try again later.
                </p>
              )}

            {/* PRICE CHART SECTION */}
            <div className="mt-5 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">
                Price history (last 1 month)
              </h4>

              {loadingPrice && selectedCompany && (
                <p className="text-xs text-slate-500">Loading price data...</p>
              )}

              {priceError && (
                <p className="text-xs text-red-600 mb-2">{priceError}</p>
              )}

              {!loadingPrice && priceData?.prices?.length > 0 && (
                <PriceChart data={priceData} />
              )}

              {!loadingPrice &&
                !priceError &&
                selectedCompany &&
                (!priceData || !priceData.prices?.length) && (
                  <p className="text-xs text-slate-500">
                    No recent price data available for this symbol.
                  </p>
                )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
