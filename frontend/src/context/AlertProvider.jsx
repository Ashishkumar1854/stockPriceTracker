// frontend/src/context/AlertProvider.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";
import { fetchAlerts, markAlertSeen } from "../services/alertService";

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const socketRef = useRef(null);

  // Load existing alerts from REST API
  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setUnseenCount(0);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAlerts();
        setAlerts(data || []);
        const unseen = (data || []).filter((a) => !a.seen).length;
        setUnseenCount(unseen);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      return;
    }

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const socket = io(baseURL, {
      withCredentials: true,
      auth: {
        userId: user.id,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected (frontend):", socket.id);
    });

    socket.on("alert:new", (alert) => {
      console.log("📩 New alert received:", alert);
      setAlerts((prev) => [alert, ...prev]);
      setUnseenCount((prev) => prev + 1);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected (frontend)");
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const markAsSeen = async (id) => {
    try {
      const updated = await markAlertSeen(id);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setUnseenCount((prev) => {
        const wasUnseen = alerts.find((a) => a.id === id && !a.seen);
        return wasUnseen ? Math.max(prev - 1, 0) : prev;
      });
    } catch (err) {
      console.error("Failed to mark alert as seen:", err);
    }
  };

  const value = {
    alerts,
    unseenCount,
    loading,
    markAsSeen,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
