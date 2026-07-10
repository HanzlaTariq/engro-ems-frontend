import { createContext, useState, useEffect } from "react";

export const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null); // Token state add

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem("adminData");
    const savedToken = sessionStorage.getItem("adminToken");
    

    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
    if (savedToken) {
      setAdminToken(savedToken); // Token set kar
    }
  }, []);

  const loginAdmin = (adminData, token) => {
    if (!token) {
      console.error("❌ Token missing in loginAdmin");
      return;
    }

    sessionStorage.setItem("adminData", JSON.stringify(adminData));
    sessionStorage.setItem("adminToken", token);

    setAdmin(adminData);
    setAdminToken(token);
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminData");
    setAdmin(null);
    setAdminToken(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, adminToken, loginAdmin, logoutAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
