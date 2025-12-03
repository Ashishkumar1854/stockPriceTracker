// frontend/src/pages/Home.jsx
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { useAuth } from "../context/AuthProvider";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryCta = () => {
    if (isAuthenticated) navigate("/dashboard");
    else navigate("/signup");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      {/* HERO */}
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
            {/* Left */}
            <div>
              <p className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                New • AI-powered sentiment for Indian stocks
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Trade with{" "}
                <span className="text-indigo-600">news-aware confidence</span>.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                AshishStockTracker reads live market news, extracts emotions
                around your watchlist companies, and predicts likely price moves
                for the next session — before you place your orders.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrimaryCta}
                  className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  {isAuthenticated ? "Open dashboard" : "Get started free"}
                </button>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                >
                  View live demo →
                </Link>
              </div>

              <div className="mt-6 grid max-w-md grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <p className="text-lg font-semibold text-slate-900">₹0</p>
                  <p>No upfront cost in MVP</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">News</p>
                  <p>Sentiment from trusted sources</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">India</p>
                  <p>Focused on NSE / BSE names</p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center">
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Live snapshot
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Example sentiment: TCS
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Based on latest headlines + VADER sentiment + simple rule
                  engine.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-slate-500">
                      Predicted move
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-600">
                      ↑ Up
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Avg compound: <span className="font-semibold">0.33</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-slate-500">
                      Articles analyzed
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      5
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Latest 24h across ET, MC, FE, etc.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-[11px]">
                  <p className="font-semibold text-slate-700">
                    What you&apos;ll get:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Company watchlist with live sentiment</li>
                    <li>Headline breakdown (positive / negative / neutral)</li>
                    <li>Simple next-session movement signal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h2 className="text-xl font-semibold text-slate-900">
              How AshishStockTracker works
            </h2>
            <div className="mt-5 grid gap-6 text-sm text-slate-600 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  1. Track
                </p>
                <p className="mt-2">
                  Add companies like <b>TCS, INFY, RELIANCE</b> to your
                  watchlist from the dashboard.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  2. Analyze
                </p>
                <p className="mt-2">
                  Our Python NLP engine scrapes recent news, runs sentiment +
                  entity detection and stores signals.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  3. Act
                </p>
                <p className="mt-2">
                  See a clean sentiment & predicted move summary before your
                  trades — especially around events.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
