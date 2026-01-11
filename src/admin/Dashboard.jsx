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
  Users
} from "lucide-react";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { admin } = useContext(AdminAuthContext);

  // Warehouse Data
  const [warehouses, setWarehouses] = useState([]);

  const fetchWarehouseData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const res = await API.get("/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWarehouses(res.data || []);
    } catch (error) {
      console.error("Warehouse fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // StatCard Component
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

  // Total capacity (string → number)
  const totalCapacity = warehouses.reduce((sum, w) => {
    const num = parseFloat(w.capacity);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        handleLogout={handleLogout}
      />

      {/* Main content area with proper scroll handling */}
      <main
        className={`flex-1 transition-all duration-300 h-screen overflow-y-auto ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          } pt-16 lg:pt-0`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
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
              onClick={fetchWarehouseData}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-xs border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""
                  }`}
              />
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              icon={Warehouse}
              title="Total Warehouses"
              value={warehouses.length}
              subtitle="Registered in system"
              color="bg-blue-500"
            />

            <StatCard
              icon={Package}
              title="Total Capacity (MT)"
              value={totalCapacity}
              subtitle="Combined warehouse capacity"
              color="bg-purple-500"
            />

            <StatCard
              icon={Activity}
              title="Active Warehouses"
              value={warehouses.length} // no status in DB → assuming all active
              subtitle="No status field present"
              color="bg-green-500"
            />

            <StatCard
              icon={AlertCircle}
              title="Inactive Warehouses"
              value={0}
              subtitle="Status not provided"
              color="bg-orange-500"
            />
          </div>

          {/* Warehouse List */}
          <div className="bg-white rounded-xl mt-10 shadow-xs border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Warehouse Overview
            </h2>

            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : warehouses.length === 0 ? (
              <p className="text-gray-600">No warehouses found.</p>
            ) : (
              <div className="space-y-4">
                {warehouses.map((w) => (
                  <div
                    key={w._id}
                    className="p-4 border rounded-xl hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {w.name}
                      </p>
                      <p className="text-sm text-gray-600">{w.location}</p>
                      <p className="text-sm text-gray-500">{w.capacity}</p>
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