import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminAuthContext } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  Users,
  BarChart3,
  Warehouse,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Menu,
  X,
  Clock,
  ShieldCheck,
  Truck,
  Boxes,
  FileBarChart,
} from "lucide-react";

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleLogout,
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

  // Flat single-page items
  const singleItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
  ];

  // Grouped / dropdown nav — keeps the sidebar compact while covering every module
  const groups = [
    {
      id: "safety",
      name: "Safety & Compliance",
      icon: ShieldCheck,
      children: [
        { id: "attendance", name: "Attendance", icon: Clock, path: "/admin/manage-attendance" },
        { id: "safety-talk", name: "Safety Talk (Labour)", icon: ShieldCheck, path: "/admin/manage-safety-talk" },
        { id: "safety-talk-trucker", name: "Safety Talk (Trucker)", icon: Truck, path: "/admin/manage-safety-talk-trucker" },
      ],
    },
    {
      id: "records",
      name: "Warehouse Records",
      icon: Boxes,
      children: [
        { id: "empty-bag", name: "Empty Bag", icon: Package, path: "/admin/manage-empty-bags" },
        { id: "pre-stationary-record", name: "Pre-Stationary Records", icon: ClipboardCheck, path: "/admin/manage-pre-stationary-record" },
      ],
    },
    {
      id: "reports",
      name: "Spot Check Reports",
      icon: FileBarChart,
      children: [
        { id: "weekly-reports", name: "Weekly Reports", icon: BarChart3, path: "/admin/weekly-reports" },
        { id: "quarterly-reports", name: "Quarterly Reports", icon: BarChart3, path: "/admin/quarterly-reports" },
      ],
    },
  ];

  const trailingItems = [
    { id: "warehouses", name: "Warehouses", icon: Warehouse, path: "/admin/manage-warehouses" },
    { id: "users", name: "User Management", icon: Users, path: "/admin/users" },
  ];

  const isActivePath = (path) => location.pathname === path;
  const groupContainsActive = (group) => group.children.some((c) => isActivePath(c.path));

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    groups.forEach((g) => {
      initial[g.id] = groupContainsActive(g);
    });
    return initial;
  });

  // Keep the relevant group expanded whenever the route changes
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        if (groupContainsActive(g)) next[g.id] = true;
      });
      return next;
    });
    setIsMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const go = (item) => {
    setActiveSection(item.id);
    navigate(item.path);
    setIsMobileOpen(false);
  };

  const showLabels = !sidebarCollapsed || isMobileOpen;

  const NavLink = ({ item, nested }) => {
    const Icon = item.icon;
    const active = isActivePath(item.path);

    return (
      <li>
        <button
          onClick={() => go(item)}
          title={!showLabels ? item.name : undefined}
          className={`group relative w-full flex items-center rounded-lg text-left transition-all duration-200
            ${nested ? "px-2.5 py-2" : "px-3 py-2.5"}
            ${
              active
                ? "text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          style={{ backgroundColor: active ? engroColors.primary : "transparent" }}
        >
          <Icon
            className={`${nested ? "w-4 h-4" : "w-[18px] h-[18px]"} flex-shrink-0 ${
              showLabels ? "mr-2.5" : ""
            } ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
          />
          {showLabels && (
            <span className={`font-medium ${nested ? "text-[13px]" : "text-sm"} flex-1 truncate`}>
              {item.name}
            </span>
          )}
          {active && (
            <div
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-1 h-4 rounded-full"
              style={{ backgroundColor: engroColors.secondary }}
            ></div>
          )}
        </button>
      </li>
    );
  };

  const NavGroup = ({ group }) => {
    const Icon = group.icon;
    const open = !!openGroups[group.id];
    const active = groupContainsActive(group);

    return (
      <li>
        <button
          onClick={() => {
            if (!showLabels) {
              // Collapsed rail: jump straight to the first child instead of expanding in place
              setSidebarCollapsed(false);
              setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
              return;
            }
            toggleGroup(group.id);
          }}
          className={`w-full flex items-center rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
            active ? "bg-green-50 text-green-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Icon
            className={`w-[18px] h-[18px] flex-shrink-0 ${showLabels ? "mr-2.5" : ""} ${
              active ? "text-green-700" : "text-gray-400"
            }`}
          />
          {showLabels && (
            <>
              <span className="font-medium text-sm flex-1 truncate">{group.name}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {showLabels && open && (
          <ul className="mt-1 mb-1 ml-4 pl-2.5 border-l-2 border-gray-100 space-y-0.5">
            {group.children.map((child) => (
              <NavLink key={child.id} item={child} nested />
            ))}
          </ul>
        )}
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
          ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
          ${sidebarCollapsed && !isMobileOpen ? "lg:w-[72px]" : "lg:w-64"}
          bg-white shadow-2xl border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col relative overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-br from-green-500 via-blue-500 to-purple-500"></div>

        {/* Header */}
        <div className="relative z-10 p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            {showLabels ? (
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${engroColors.primary}, ${engroColors.primaryDark})` }}
                >
                  <span className="text-white font-bold text-base">E</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-800 leading-tight truncate">
                    EFERT WAREHOUSING
                  </h2>
                  <p className="text-[11px] text-gray-400 leading-tight">Admin Console</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: `linear-gradient(135deg, ${engroColors.primary}, ${engroColors.primaryDark})` }}
                >
                  <span className="text-white font-bold text-base">E</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 transition-colors ml-2 flex-shrink-0"
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
        <nav className="relative z-10 flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1">
            {singleItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </ul>

          {showLabels && (
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Operations
            </p>
          )}
          <ul className="space-y-1">
            {groups.map((group) => (
              <NavGroup key={group.id} group={group} />
            ))}
          </ul>

          {showLabels && (
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Administration
            </p>
          )}
          <ul className="space-y-1">
            {trailingItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </ul>
        </nav>

        {/* User Section & Logout */}
        <div className="relative z-10 p-3 border-t border-gray-100 bg-white/80 flex-shrink-0">
          {showLabels ? (
            <>
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {admin?.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {admin?.email || "System Administrator"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2.5" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
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