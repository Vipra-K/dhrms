import { useState } from "react";
import { AuthContext } from "./AuthContext";

const readStoredUser = () => {
  try {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) return null;
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginUser,
        logout,
        isAuthenticated: Boolean(user),
        initializing: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
