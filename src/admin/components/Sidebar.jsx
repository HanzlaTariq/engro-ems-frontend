import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminAuthContext } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  Warehouse,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Menu,
  X
} from "lucide-react";
import { path } from "framer-motion/client";

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin } = useContext(AdminAuthContext);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const engroColors = {
    primary: "#00A859",
    primaryDark: "#008E4A",
    secondary: "#FF671F",
  };

  const navItems = [
    { 
      id: "dashboard", 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      path: "/admin/dashboard",
      badge: null
    },
    { 
      id: "empty-bag", 
      name: "Empty Bag", 
      icon: Package, 
      path: "/admin/manage-empty-bags",
    },
    
    { 
      id: "users", 
      name: "User Management", 
      icon: Users, 
      path: "/admin/users",
      badge: null
    },
    {
      id: "pre-stationary-record",
      name: "Pre-Stationary Records",
      icon: ClipboardCheck,
      path: "/admin/manage-pre-stationary-record",
      badge: null
    },
    
    { 
      id: "warehouses", 
      name: "Warehouses", 
      icon: Warehouse, 
      path: "/admin/manage-warehouses",
      badge: null
    },
    {
      id:"Weekly Reports",
      name: "Weekly Reports",
      icon: BarChart3,
      path: "/admin/weekly-reports",
      badge: null
    },
    {
      id: "Quarterly Reports",
      name: "Quarterly Reports",
      icon: BarChart3,
      path: "/admin/quarterly-reports",
      badge: null
    },
    
    
  ];

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <li key={item.id}>
        <button
          onClick={() => {
            setActiveSection(item.id);
            navigate(item.path);
            setIsMobileOpen(false);
          }}
          className={`group relative w-full flex items-center rounded-xl px-3 py-3 text-left transition-all duration-300 ${
            active
              ? 'text-white shadow-lg transform scale-[1.02]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
          }`}
          style={{
            backgroundColor: active ? engroColors.primary : 'transparent',
          }}
        >
          {/* Animated background effect */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 to-green-600 opacity-0 transition-opacity duration-300 ${
            active ? 'opacity-100' : 'group-hover:opacity-5'
          }`}></div>
          
          <div className="relative z-10 flex items-center w-full">
            <Icon className={`w-5 h-5 transition-transform duration-300 ${
              (sidebarCollapsed && !isMobileOpen) ? '' : 'mr-3'
            } ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
            
            {(!sidebarCollapsed || isMobileOpen) && (
              <>
                <span className="font-medium text-sm flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    active 
                      ? 'bg-white text-green-600' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Active indicator */}
          {active && (
            <div 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-full"
              style={{ backgroundColor: engroColors.secondary }}
            ></div>
          )}
        </button>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed && !isMobileOpen ? 'lg:w-20' : 'lg:w-64'}
          bg-white shadow-2xl border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col relative overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-br from-green-500 via-blue-500 to-purple-500"></div>
        
        {/* Header */}
        <div className="relative z-10 p-4 lg:p-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            {(!sidebarCollapsed || isMobileOpen) ? (
              <div className="flex items-center space-x-3 animate-fade-in flex-1">
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${engroColors.primary}, ${engroColors.primaryDark})`
                  }}
                >
                  <span className="text-white font-bold text-lg lg:text-xl">E</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-700 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    EFERT- WAREHOUSING 
                  </h2>
                </div>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${engroColors.primary}, ${engroColors.primaryDark})`
                  }}
                >
                  <span className="text-white font-bold text-lg lg:text-xl">E</span>
                </div>
              </div>
            )}

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Desktop collapse button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors ml-2"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="relative z-10 flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </ul>
        </nav>

        {/* User Section & Logout - Fixed height */}
        <div className="relative z-10 p-4 border-t border-gray-100 bg-white/80 flex-shrink-0">
          {(!sidebarCollapsed || isMobileOpen) ? (
            <>
              <div className="mb-4 p-3 lg:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  </div>

                  {/* Admin Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {admin?.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500 truncate hidden sm:block">
                      {admin?.email || "System Administrator"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="group w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>

              <button
                onClick={handleLogout}
                className="p-2 lg:p-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
    </>
  );
}