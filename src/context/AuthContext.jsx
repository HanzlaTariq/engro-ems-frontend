import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch (err) {
      console.error("❌ Failed to parse user from sessionStorage:", err);
      sessionStorage.removeItem("user"); // corrupted data clear
      return null;
    }
  });

  useEffect(() => {
    // future: verify token with backend if needed
  }, []);

  const login = (token, userObj) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
