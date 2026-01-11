import { createContext, useState, useEffect } from "react";

export const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null);  // Token state add

  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminData");
    const savedToken = localStorage.getItem("adminToken");
    console.log('🔍 Loading admin from localStorage - Token:', savedToken ? 'Present' : 'Missing');  // Temp log

    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    if (savedToken) {
      setAdminToken(savedToken);  // Token set kar
    }
  }, []);

  const loginAdmin = (adminData, token) => {
  if (!token) {
    console.error("❌ Token missing in loginAdmin");
    return;
  }

  localStorage.setItem("adminData", JSON.stringify(adminData));
  localStorage.setItem("adminToken", token);

  setAdmin(adminData);
  setAdminToken(token);

  console.log("✅ Token saved successfully:", token);
};


  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setAdmin(null);
    setAdminToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}