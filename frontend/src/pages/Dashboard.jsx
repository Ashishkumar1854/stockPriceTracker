// frontend/src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
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

        {/* Placeholder sections for your core features */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Watchlist (coming soon)
            </h3>
            <p className="text-xs text-slate-500">
              Here we&apos;ll show list of companies you track: TCS, INFY,
              RELIANCE, etc., with quick sentiment + price trend summary.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Today&apos;s Sentiment & Prediction (coming soon)
            </h3>
            <p className="text-xs text-slate-500">
              This section will show combined sentiment score & predicted move
              for next session, based on latest news your NLP engine processes.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
