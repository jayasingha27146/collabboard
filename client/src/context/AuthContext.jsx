import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService.js";
import {
  safeRead,
  safeRemove,
  safeWrite,
  storageKeys,
} from "../utils/storage.js";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id || user._id || "demo-user",
    fullName: user.fullName || user.name || "Student User",
    email: user.email || "student@example.com",
    role: user.role || "Member",
    avatar:
      user.avatar ||
      (user.fullName || user.name || "SU").slice(0, 2).toUpperCase(),
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(storageKeys.authToken) || "",
  );
  const [user, setUser] = useState(() => safeRead(storageKeys.authUser, null));
  const [loading, setLoading] = useState(false);

  function logout() {
    safeRemove(storageKeys.authToken);
    safeRemove(storageKeys.authUser);
    setToken("");
    setUser(null);
  }

  useEffect(() => {
    if (!token || user) {
      return;
    }

    async function hydrateProfile() {
      try {
        const response = await authService.getProfile();
        const nextUser = normalizeUser(
          response?.data?.user || response?.data || response?.user || response,
        );
        setUser(nextUser);
        safeWrite(storageKeys.authUser, nextUser);
      } catch {
        logout();
      }
    }

    hydrateProfile();
  }, [token, user]);

  useEffect(() => {
    if (user) {
      safeWrite(storageKeys.authUser, user);
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const nextToken =
        response?.data?.token || response?.token || response?.accessToken;
      const nextUser = normalizeUser(response?.data?.user || response?.user);

      if (!nextToken || !nextUser) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem(storageKeys.authToken, nextToken);
      safeWrite(storageKeys.authUser, nextUser);
      setToken(nextToken);
      setUser(nextUser);
      return { success: true };
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await authService.register(payload);
      return { success: true, data: response };
    } catch (error) {
      console.error("Registration error:", error);
      alert(`Registration failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      setUser,
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
