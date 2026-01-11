import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AdminAuthProvider>
    <AuthProvider><App /></AuthProvider>
    </AdminAuthProvider>
  </React.StrictMode>
);
