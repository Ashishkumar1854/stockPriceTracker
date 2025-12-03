// frontend/src/components/ui/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: connect to real price tracker endpoint
    // For now just navigate + show console log
    console.log("Search company:", query);
    alert("Real-time price & sentiment search coming soon 🚀");
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
            AS
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">
              AshishStockTracker
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              emotion & news radar
            </p>
          </div>
        </Link>

        {/* Search – center on desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden flex-1 items-center justify-center px-6 md:flex"
        >
          <div className="flex w-full max-w-md overflow-hidden rounded-full border border-slate-200 bg-slate-50/60 shadow-sm">
            <input
              type="text"
              placeholder="Search company (TCS, INFY, RELIANCE...)"
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 text-xs font-medium uppercase tracking-wide text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right side – auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="hidden text-right text-xs md:block">
                <p className="font-medium text-slate-800">
                  {user.name || "Investor"}
                </p>
                <p className="text-[10px] text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 md:inline-block"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="hidden rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 md:inline-block"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
