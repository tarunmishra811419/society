import { createContext, useState, useEffect } from "react";
import { api, login as apiLogin, logout as apiLogout, getAccessToken } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On page load/refresh, if a token is already saved, try to restore
  // the session instead of forcing a fresh login every time.
  useEffect(() => {
    async function restoreSession() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const user = await api.get("/auth/me/");
        setCurrentUser(user);
      } catch {
        // token invalid/expired and refresh failed — stay logged out
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(username, password) {
    setError(null);
    try {
      await apiLogin(username, password);
      const user = await api.get("/auth/me/");
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  function logout() {
    apiLogout();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}