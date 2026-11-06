import { useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Bell } from "lucide-react";
import usePendingApprovals from "../admin/components/usePendingApprovals";

// Har admin page (dashboard ke ilawa) ke upar sticky bar: Back + Dashboard + pending approvals
const AdminTopBar = () => {
  const navigate = useNavigate();
  const { total } = usePendingApprovals();

  const goBack = () => {
    // Agar pichla page isi app me hai to wahan, warna dashboard
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate("/admin/dashboard");
  };

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-semibold text-sm transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" /> <span>Dashboard</span>
        </button>
        {total > 0 && (
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="ml-auto inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold text-xs sm:text-sm"
            title="Pending approvals"
          >
            <Bell className="w-4 h-4" />
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
              {total > 99 ? "99+" : total}
            </span>
            <span className="hidden sm:inline">pending</span>
          </button>
        )}
      </div>
    </div>
  );
};

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLoggedIn = sessionStorage.getItem("adminToken");

  const timeoutLimit = 5 * 60 * 1000;

  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        sessionStorage.removeItem("adminToken"); // logout
        sessionStorage.removeItem("adminData");
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

  if (location.pathname === "/admin/dashboard") return children;

  return (
    <>
      <AdminTopBar />
      {children}
    </>
  );
};

export default AdminProtectedRoute;
