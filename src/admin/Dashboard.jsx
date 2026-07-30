import React, { useState, useEffect, useContext } from "react";
import Sidebar from "./components/Sidebar";
import { useNavigate } from "react-router-dom";
import { AdminAuthContext } from "./context/AdminAuthContext";
import API from "../utils/api.js";
import {
  RefreshCw,
  Warehouse,
  Package,
  Activity,
  AlertCircle,
  Users,
  Clock,
  ShieldCheck,
  Truck,
  ClipboardCheck,
  BarChart3,
  CheckCircle2,
  Hourglass,
  MapPin,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { admin } = useContext(AdminAuthContext);

  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");
      const token = sessionStorage.getItem("adminToken");

      const res = await API.get("/api/dashboard-stats/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOverview(res.data);
    } catch (err) {
      console.error("Dashboard overview fetch error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  // ---------- Small building blocks ----------

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="group bg-white rounded-xl shadow-xs border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          {loading ? (
            <div className="h-7 w-20 bg-gray-200 rounded mt-2 animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // A compact module row used inside the "Records & Verification Overview" panel
  const ModuleRow = ({ icon: Icon, name, stats, color, onClick }) => {
    const total = stats?.total ?? 0;
    const verified = stats?.verified ?? 0;
    const pending = stats?.pending ?? 0;
    const pct = total > 0 ? Math.round((verified / total) * 100) : 0;

    return (
      <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800 text-sm">{name}</span>
          </div>
          <span className="text-xs text-gray-500">{total} total</span>
        </div>

        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> {verified} verified
          </span>
          <span className="flex items-center gap-1 text-orange-600">
            <Hourglass className="w-3.5 h-3.5" /> {pending} pending
          </span>
        </div>
      </button>
    );
  };

  const totalCapacity = overview?.warehouses?.totalCapacity ?? 0;
  const totalWarehouses = overview?.warehouses?.total ?? 0;
  const activeWarehouses = overview?.warehouses?.active ?? 0;
  const inactiveWarehouses = overview?.warehouses?.inactive ?? 0;
  const warehouseList = overview?.warehouses?.list ?? [];

  const pendingVerifications = overview?.pendingVerifications ?? 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        handleLogout={handleLogout}
      />

      <main
        className={`flex-1 transition-all duration-300 h-screen overflow-y-auto ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        } pt-16 lg:pt-0`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Operations Dashboard
              </h1>
              <p className="text-gray-600 mt-2 flex items-center text-base">
                <Users className="w-4 h-4 mr-2 text-green-600" /> Welcome{" "}
                {admin?.name || "Admin"}!
              </p>
            </div>

            <button
              onClick={fetchOverview}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-xs border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Top-level Warehouse Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              icon={Warehouse}
              title="Total Warehouses"
              value={totalWarehouses}
              subtitle="Registered in system"
              color="bg-blue-500"
            />
            <StatCard
              icon={Activity}
              title="Active Warehouses"
              value={activeWarehouses}
              subtitle="Currently operational"
              color="bg-green-500"
            />
            <StatCard
              icon={AlertCircle}
              title="Inactive Warehouses"
              value={inactiveWarehouses}
              subtitle="Marked inactive"
              color="bg-gray-500"
            />
            <StatCard
              icon={Package}
              title="Total Capacity"
              value={totalCapacity}
              subtitle="Combined warehouse capacity"
              color="bg-purple-500"
            />
          </div>

          {/* Pending verifications banner */}
          {!loading && pendingVerifications > 0 && (
            <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-orange-50 border border-orange-100">
              <Hourglass className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <p className="text-sm text-orange-800">
                <span className="font-semibold">{pendingVerifications}</span> record
                {pendingVerifications === 1 ? "" : "s"} across all modules are still waiting for
                DO verification.
              </p>
            </div>
          )}

          {/* Records & Verification Overview */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Records & Verification Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <ModuleRow
                icon={Clock}
                name="Attendance"
                stats={overview?.attendance}
                color="bg-blue-500"
                onClick={() => navigate("/admin/manage-attendance")}
              />
              <ModuleRow
                icon={ShieldCheck}
                name="Safety Talk (Labour)"
                stats={overview?.safetyTalk}
                color="bg-emerald-500"
                onClick={() => navigate("/admin/manage-safety-talk")}
              />
              <ModuleRow
                icon={Truck}
                name="Safety Talk (Trucker)"
                stats={overview?.safetyTalkTrucker}
                color="bg-orange-500"
                onClick={() => navigate("/admin/manage-safety-talk-trucker")}
              />
              <ModuleRow
                icon={Package}
                name="Empty Bag Records"
                stats={overview?.emptyBag}
                color="bg-indigo-500"
                onClick={() => navigate("/admin/manage-empty-bags")}
              />
              <ModuleRow
                icon={ClipboardCheck}
                name="Pre-Stationary Records"
                stats={overview?.preStationary}
                color="bg-pink-500"
                onClick={() => navigate("/admin/manage-pre-stationary-record")}
              />
              <ModuleRow
                icon={BarChart3}
                name="Weekly Spot Check"
                stats={overview?.weeklySpotCheck}
                color="bg-teal-500"
                onClick={() => navigate("/admin/weekly-reports")}
              />
              <ModuleRow
                icon={BarChart3}
                name="Quarterly Spot Check"
                stats={overview?.quarterlySpotCheck}
                color="bg-cyan-600"
                onClick={() => navigate("/admin/quarterly-reports")}
              />
            </div>
          </div>

          {/* Warehouse Overview */}
          <div className="bg-white rounded-xl mt-10 shadow-xs border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Warehouse Overview</h2>
              <button
                onClick={() => navigate("/admin/manage-warehouses")}
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                Manage Warehouses →
              </button>
            </div>

            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : warehouseList.length === 0 ? (
              <p className="text-gray-600">No warehouses found.</p>
            ) : (
              <div className="space-y-3">
                {warehouseList.map((w) => (
                  <div
                    key={w._id}
                    className="p-4 border rounded-xl hover:bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            w.status === "Inactive" ? "bg-gray-400" : "bg-green-500"
                          }`}
                        ></span>
                        <p className="text-base font-semibold text-gray-900">{w.name}</p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            w.status === "Inactive"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {w.status === "Inactive" ? "Inactive" : "Active"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {w.location}
                        {w.city ? `, ${w.city}` : ""}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {w.capacity ? `Capacity: ${w.capacity}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}