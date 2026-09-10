import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getCurrentSession, logout as logoutSession } from "../services/authService";

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const readStoredUser = () => {
  try {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) return null;
    return JSON.parse(storedUser);
  } catch {
    clearStoredAuth();
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const session = await getCurrentSession();
        const userData = {
          userId: session.userId,
          email: session.email,
          role: session.role,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } catch {
        clearStoredAuth();
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const loginUser = (authResponse) => {
    const userData = {
      userId: authResponse.userId,
      email: authResponse.email,
      role: authResponse.role,
    };
    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await logoutSession();
      }
    } catch {
      // Local cleanup still happens if the API is unreachable or the session is already invalid.
    } finally {
      clearStoredAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginUser,
        logout,
        isAuthenticated: Boolean(user),
        initializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
