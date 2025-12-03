// frontend/src/components/ui/Footer.jsx
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} AshishStockTracker. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="hover:text-slate-700">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-slate-700">
            Dashboard
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">
            Built for emotion-driven stock insights 💹
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
