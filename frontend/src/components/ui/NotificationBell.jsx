// frontend/src/components/ui/NotificationBell.jsx
import { useState } from "react";
import { useAlerts } from "../../context/AlertProvider";

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
};

const NotificationBell = () => {
  const { alerts, unseenCount, loading, markAsSeen } = useAlerts();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((o) => !o);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-slate-100 border border-slate-200"
      >
        <span className="text-lg">🔔</span>
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-20">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Notifications
            </span>
            {loading && (
              <span className="text-[10px] text-slate-400">Loading...</span>
            )}
          </div>

          <div className="max-h-72 overflow-auto">
            {alerts.length === 0 && !loading && (
              <p className="px-3 py-4 text-xs text-slate-500">
                No alerts yet. You&apos;ll see sentiment/price alerts here.
              </p>
            )}

            {alerts.map((a) => (
              <button
                key={a.id}
                onClick={() => markAsSeen(a.id)}
                className={`w-full text-left px-3 py-2 text-xs border-b border-slate-50 hover:bg-slate-50 ${
                  !a.seen ? "bg-indigo-50/60" : "bg-white"
                }`}
              >
                <p
                  className={`font-medium ${
                    !a.seen ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {a.message}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatTime(a.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
