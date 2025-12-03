// frontend/src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  login as loginApi,
  signup as signupApi,
  me as meApi,
  logout as logoutApi,
  refreshToken as refreshApi,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(true);

  // Helper: set token both in state & localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
    } else {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
    }
  };

  // On mount: try to fetch /me if we have a token
  useEffect(() => {
    const init = async () => {
      try {
        if (!accessToken) {
          setLoading(false);
          return;
        }
        const data = await meApi();
        setUser(data.user);
      } catch (err) {
        // token invalid -> try refresh
        try {
          const refreshRes = await refreshApi();
          setToken(refreshRes.accessToken);
          const data = await meApi();
          setUser(data.user);
        } catch (e) {
          // cannot refresh
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []); // run once

  const login = async ({ email, password }) => {
    const data = await loginApi({ email, password });
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const signup = async ({ name, email, password }) => {
    const data = await signupApi({ name, email, password });
    return data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // ignore
    }
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
