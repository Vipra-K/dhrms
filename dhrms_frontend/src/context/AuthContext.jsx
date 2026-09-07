import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setInitializing(false);
    }
  }, []);

  const loginUser = (authResponse) => {
    const userData = { userId: authResponse.userId, email: authResponse.email, role: authResponse.role };
    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, isAuthenticated: !!user, initializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
