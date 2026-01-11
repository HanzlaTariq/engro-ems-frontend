import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAdminLoggedIn = localStorage.getItem("adminToken");

  // 2 minutes in milliseconds
  const timeoutLimit = 2 * 60 * 10000;

  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        localStorage.removeItem("adminToken"); // logout
        navigate("/admin/login"); // redirect
      }, timeoutLimit);
    };

    // Track user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // Start timer when component mounts

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isAdminLoggedIn, navigate]);

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default AdminProtectedRoute;
