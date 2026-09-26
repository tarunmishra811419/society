import { createContext, useState, useEffect } from "react";
import { api, login as apiLogin, logout as apiLogout, getAccessToken, getUser, setUser } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getUser());
  const [loading, setLoading] = useState(() => !getUser() && !!getAccessToken());
  const [error, setError] = useState(null);

  // On page load/refresh, if a token is already saved, restore/verify
  // the session with the backend without clearing user state during the fetch.
  useEffect(() => {
    async function restoreSession() {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const user = await api.get("/auth/me/");
        setCurrentUser(user);
        setUser(user);
      } catch (err) {
        // Only clear if access token was wiped out (e.g. refresh failed permanently)
        if (!getAccessToken()) {
          setCurrentUser(null);
          setUser(null);
        }
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
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  function logout() {
    apiLogout();
    setUser(null);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
