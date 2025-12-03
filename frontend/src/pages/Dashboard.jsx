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
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";

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

  // Helper: sentiment color based on predicted move
  const sentimentColor =
    analysis?.predicted_move === "up"
      ? "text-emerald-600"
      : analysis?.predicted_move === "down"
      ? "text-red-600"
      : "text-slate-700";

  const sentimentBg =
    analysis?.predicted_move === "up"
      ? "bg-emerald-50 border-emerald-200"
      : analysis?.predicted_move === "down"
      ? "bg-red-50 border-red-200"
      : "bg-slate-50 border-slate-200";

  // MVP: add hardcoded TCS to watchlist (for demo)
  const handleAddTcsToWatchlist = async () => {
    setAdding(true);
    try {
      const company = await createCompany({
        ticker: "TCS",
        name: "Tata Consultancy Services",
        exchange: "NSE",
      });

      await addToWatchlist(company.id);

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
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Global navbar with search + profile */}
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        {/* LEFT COLUMN: account + watchlist */}
        <section className="flex w-full flex-col gap-4 md:w-2/5">
          {/* Account card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Account
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Welcome back, {user?.name || "Investor"} 👋
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-medium text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>

            {user ? (
              <div className="mt-4 space-y-1 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Name:</span> {user.name || "—"}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Provider:</span>{" "}
                  {user.provider || "local"}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                No user info loaded. Try logging in again.
              </p>
            )}
          </div>

          {/* Watchlist card */}
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Watchlist
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Selecting a company updates the sentiment card on the right.
                </p>
              </div>
              <button
                onClick={handleAddTcsToWatchlist}
                disabled={adding}
                className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {adding ? "Adding..." : "Add TCS demo"}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {loadingWatchlist && (
                <p className="text-xs text-slate-500">Loading watchlist...</p>
              )}

              {watchlistError && (
                <p className="text-xs text-red-600">{watchlistError}</p>
              )}

              {!loadingWatchlist &&
                watchlist.length === 0 &&
                !watchlistError && (
                  <p className="text-xs text-slate-500">
                    No companies yet. Use{" "}
                    <span className="font-semibold">“Add TCS demo”</span> to add
                    your first company.
                  </p>
                )}

              {watchlist.map((item) => {
                const c = item.company;
                const isSelected = selectedCompany?.id === c.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCompany(c)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {c.ticker}
                        {c.exchange ? ` · ${c.exchange}` : ""}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {c.name}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: sentiment & prediction */}
        <section className="flex w-full flex-1 flex-col gap-4 md:w-3/5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Overview
            </p>
            <p className="mt-1 text-sm text-slate-600">
              This is your personal AI dashboard. Soon you&apos;ll get:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Live sentiment for each company in your watchlist</li>
              <li>Next-session price move hints (up / down / sideways)</li>
              <li>Alerts for negative news spikes</li>
            </ul>
          </div>

          <div className={`rounded-2xl border ${sentimentBg} p-5 shadow-sm`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Today&apos;s Sentiment & Prediction
                </p>
                {selectedCompany && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Showing analysis for{" "}
                    <span className="font-semibold">
                      {selectedCompany.ticker} — {selectedCompany.name}
                    </span>
                  </p>
                )}
                {!selectedCompany && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Select a company from your watchlist to view sentiment.
                  </p>
                )}
              </div>
            </div>

            {/* States */}
            {loadingAnalysis && selectedCompany && (
              <p className="mt-4 text-xs text-slate-500">
                Fetching latest sentiment...
              </p>
            )}

            {analysisError && (
              <p className="mt-4 text-xs text-red-600">{analysisError}</p>
            )}

            {!loadingAnalysis &&
              !analysis &&
              !analysisError &&
              selectedCompany && (
                <p className="mt-4 text-xs text-slate-500">
                  No sentiment data yet. Try again later.
                </p>
              )}

            {/* Main analysis */}
            {analysis && !analysisError && (
              <>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-white/70 p-4 text-sm">
                    <p className="text-[11px] font-semibold uppercase text-slate-500">
                      Company
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {analysis.company || selectedCompany?.ticker}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/70 p-4 text-sm">
                    <p className="text-[11px] font-semibold uppercase text-slate-500">
                      Predicted move
                    </p>
                    <p className={`mt-1 text-xl font-bold ${sentimentColor}`}>
                      {analysis.predicted_move === "up"
                        ? "↑ Up"
                        : analysis.predicted_move === "down"
                        ? "↓ Down"
                        : "→ Sideways"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/70 p-4 text-sm">
                    <p className="text-[11px] font-semibold uppercase text-slate-500">
                      Avg sentiment (compound)
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {analysis.avg_compound?.toFixed(3)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Articles analyzed:{" "}
                      <span className="font-semibold">
                        {analysis.article_count}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Articles */}
                {analysis.articles && analysis.articles.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Latest news sentiment
                    </p>
                    <div className="space-y-3 text-xs max-h-64 overflow-auto pr-1">
                      {analysis.articles.map((a, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white/80 p-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="md:max-w-[70%]">
                            <p className="font-medium text-slate-800">
                              {a.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 md:justify-end">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                a.sentiment?.label === "positive"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : a.sentiment?.label === "negative"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {a.sentiment?.label?.toUpperCase()} ·{" "}
                              {a.sentiment?.scores?.compound?.toFixed(3)}
                            </span>
                            {a.link && (
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-medium text-indigo-600 hover:underline"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
