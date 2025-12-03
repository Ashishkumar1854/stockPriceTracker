// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getCompanyAnalysisById } from "../services/analysisService";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // For now, fixed companyId = 1 (TCS) as MVP
  const [selectedCompanyId] = useState(1);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedCompanyId) return;
      setLoadingAnalysis(true);
      setAnalysisError("");
      try {
        const data = await getCompanyAnalysisById(selectedCompanyId);
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
  }, [selectedCompanyId]);

  // Helper: sentiment color
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
              This is your personal dashboard. Soon you&apos;ll see:
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

        {/* Watchlist + Sentiment */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Watchlist placeholder */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Watchlist (coming soon)
            </h3>
            <p className="text-xs text-slate-500">
              Here we&apos;ll show list of companies you track: TCS, INFY,
              RELIANCE, etc., with quick sentiment + price trend summary.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Currently demo sentiment is fetched for{" "}
              <span className="font-semibold">company ID 1 (TCS)</span>.
            </p>
          </div>

          {/* Sentiment & Prediction card */}
          <div className={`rounded-xl shadow-sm p-5 border ${sentimentBg}`}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Today&apos;s Sentiment & Prediction
            </h3>

            {loadingAnalysis && (
              <p className="text-xs text-slate-500">Loading sentiment...</p>
            )}

            {analysisError && (
              <p className="text-xs text-red-600 mb-2">{analysisError}</p>
            )}

            {!loadingAnalysis && analysis && !analysisError && (
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

            {!loadingAnalysis && !analysis && !analysisError && (
              <p className="text-xs text-slate-500">
                No sentiment data yet. Try again later.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
