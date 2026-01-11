import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../utils/api";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    attendanceToday: "Loading...",
    todayDetails: null,
    safetyTalksToday: 0,
    todaySafetyTalks: [],
    emptyBagRecords: [],
    preNumberRecords: [],
    spotCheckRecords: [],
    quarterlySpotCheckRecords: [],
    loading: true,
  });
  const [spotCheckAlert, setSpotCheckAlert] = useState(null);
  const [quarterlySpotCheckAlert, setQuarterlySpotCheckAlert] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  const engroColors = {
    primary: "#00A859",
    secondary: "#FF671F",
    dark: "#1D3F36",
    light: "#F0F7F4",
    neutral: "#4A4A4A",
    lightGray: "#F5F5F5",
    white: "#FFFFFF",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    success: "#10b981",
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  };

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper functions
  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime12 = (timeStr) => {
    if (!timeStr) return "--";
    let [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const getDOStatusColor = (status) => {
    if (status === "Verified") return "#10b981";
    if (status === "DO Not Verified") return "#EF4444";
    return "#F59E0B";
  };

  const getConditionColor = (condition) => {
    if (["Good", "Perfect", "Completed", "Ok", "Charge", "Good", "Perfect", "Verified"].includes(condition)) return "#10b981";
    if (["Needs Attention", "Repairing", "Pending", "Medium", "Low", "Ok", "Not Verified"].includes(condition)) return "#F59E0B";
    if (["Poor", "Not Working", "Not Charge", "Repairing", "Need Maintenance", "DO Not Verified"].includes(condition)) return "#EF4444";
    return "#6B7280";
  };

  // Check if weekly spot check is due (7 days)
  const checkSpotCheckDue = (lastCheckDate) => {
    if (!lastCheckDate) return { 
      due: true, 
      days: 7, 
      message: "No weekly spot check recorded yet",
      severity: "high",
      type: "weekly"
    };
    
    const lastDate = new Date(lastCheckDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 7) {
      return { 
        due: true, 
        days: diffDays, 
        message: `Weekly spot check overdue by ${diffDays - 7} days! Please add new record.`,
        severity: "high",
        type: "weekly"
      };
    } else if (diffDays >= 5) {
      return { 
        due: false, 
        days: diffDays, 
        message: `Last weekly check was ${diffDays} days ago. ${7 - diffDays} days remaining for next check.`,
        severity: "medium",
        type: "weekly"
      };
    } else {
      return { 
        due: false, 
        days: diffDays, 
        message: `Last weekly check was ${diffDays} days ago. ${7 - diffDays} days remaining.`,
        severity: "low",
        type: "weekly"
      };
    }
  };

  // Check if quarterly spot check is due (14 days)
  const checkQuarterlySpotCheckDue = (lastCheckDate) => {
    if (!lastCheckDate) return { 
      due: true, 
      days: 14, 
      message: "No quarterly spot check recorded yet",
      severity: "high",
      type: "quarterly"
    };
    
    const lastDate = new Date(lastCheckDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 14) {
      return { 
        due: true, 
        days: diffDays, 
        message: `Quarterly spot check overdue by ${diffDays - 14} days! Please add new record.`,
        severity: "high",
        type: "quarterly"
      };
    } else if (diffDays >= 7) { // 3 weeks before due
      return { 
        due: false, 
        days: diffDays, 
        message: `Last quarterly check was ${diffDays} days ago. ${14 - diffDays} days remaining for next check.`,
        severity: "medium",
        type: "quarterly"
      };
    } else {
      return { 
        due: false, 
        days: diffDays, 
        message: `Last quarterly check was ${diffDays} days ago. ${14 - diffDays} days remaining.`,
        severity: "low",
        type: "quarterly"
      };
    }
  };

  // Calculate equipment status
  const calculateEquipmentStatus = (spotCheckData) => {
    if (!spotCheckData) return { 
      stitchingMachine: "No Data", 
      weighingScale: "No Data", 
      upsBattery: "No Data",
      fireExtinguishers: 0,
      safetyRamp: 0,
      srlHarness: 0,
      medicine: "No Data",
      verifiedBy: "Not Verified"
    };
    
    return {
      stitchingMachine: spotCheckData.stitchingMachine?.condition || "No Data",
      weighingScale: spotCheckData.weighingScale?.condition || "No Data",
      upsBattery: spotCheckData.upsBattery?.condition || "No Data",
      fireExtinguishers: spotCheckData.fireExtinguishers?.length || 0,
      safetyRamp: spotCheckData.safetyRamp?.filter(r => r.good)?.length || 0,
      srlHarness: spotCheckData.srlHarness?.filter(h => h.status === "Good")?.length || 0,
      medicine: spotCheckData.medicine || "No Data",
      verifiedBy: spotCheckData.verifiedBy || "Not Verified"
    };
  };

  // API fetching function
  const fetchData = async (url) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      return null;
    }
  };

  // Fetch all data
  useEffect(() => {
    const loadDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Fetch attendance
        const attendanceRes = await API.get("/api/attendance/my?page=1&limit=1000").then(res => res.data);

        if (attendanceRes?.attendances) {
          const todayStr = new Date().toISOString().split("T")[0];
          const todayRecord = attendanceRes.attendances.find(
            (item) => item.date?.slice(0, 10) === todayStr
          );
          setDashboardData(prev => ({
            ...prev,
            attendanceToday: todayRecord ? "Present" : "Absent",
            todayDetails: todayRecord || null,
          }));
        }

        // Fetch safety talks
        const safetyTalksRes = await API.get("/api/safety-talk/my").then(res => res.data);

        if (safetyTalksRes) {
          const talks = safetyTalksRes.records || safetyTalksRes;
          const todayStr = new Date().toISOString().split("T")[0];
          const todayTalks = Array.isArray(talks) ? talks.filter(t => t.date?.slice(0, 10) === todayStr) : [];
          setDashboardData(prev => ({
            ...prev,
            safetyTalksToday: todayTalks.length,
            todaySafetyTalks: todayTalks,
          }));
        }

        // Fetch empty bag records
       const emptyBagRes = await API.get("/api/empty-bag-record/my").then(res => res.data);

        if (emptyBagRes) {
          const records = emptyBagRes.records || emptyBagRes.data || (Array.isArray(emptyBagRes) ? emptyBagRes : []);
          const todayStr = new Date().toISOString().split("T")[0];
          const todayRecords = Array.isArray(records) ? records.filter(r => r.date?.slice(0, 10) === todayStr) : [];
          const totalBalance = todayRecords.reduce((sum, r) => sum + (r.balanceQty || 0), 0);
          setDashboardData(prev => ({
            ...prev,
            emptyBagRecords: todayRecords,
            emptyBagTotalToday: todayRecords.length,
            totalBalanceQty: totalBalance,
            latestEmptyBagRecord: todayRecords[todayRecords.length - 1] || null,
          }));
        }

        // Fetch pre-number records
        const preNumberRes = await API.get("/api/pre-number-stationary-record/my").then(res => res.data);

        if (preNumberRes) {
          const records = preNumberRes.records || preNumberRes.data || (Array.isArray(preNumberRes) ? preNumberRes : []);
          const todayStr = new Date().toISOString().split("T")[0];
          const todayRecords = Array.isArray(records) ? records.filter(r => r.startDate?.slice(0, 10) === todayStr) : [];
          setDashboardData(prev => ({
            ...prev,
            preNumberRecords: todayRecords,
            preNumberTotalToday: todayRecords.length,
            latestPreNumberRecord: todayRecords[todayRecords.length - 1] || null,
          }));
        }

        // Fetch weekly spot checks
        const spotCheckRes = await API.get("/api/spot-check/my").then(res => res.data);

        
        if (spotCheckRes) {
          let records = [];
          
          // Handle different API response structures
          if (spotCheckRes.data && Array.isArray(spotCheckRes.data)) {
            records = spotCheckRes.data;
          } else if (spotCheckRes.records && Array.isArray(spotCheckRes.records)) {
            records = spotCheckRes.records;
          } else if (Array.isArray(spotCheckRes)) {
            records = spotCheckRes;
          }
          
          // Sort by date descending (newest first)
          const sortedRecords = records.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          
          const latestRecord = sortedRecords[0] || null;
          const equipmentStatus = calculateEquipmentStatus(latestRecord);
          
          // Check if weekly spot check is due
          const dueCheck = checkSpotCheckDue(latestRecord?.date);
          setSpotCheckAlert(dueCheck);
          
          setDashboardData(prev => ({
            ...prev,
            spotCheckRecords: sortedRecords,
            spotCheckTotalThisWeek: sortedRecords.filter(r => {
              if (!r.date) return false;
              const recordDate = new Date(r.date);
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return recordDate >= sevenDaysAgo;
            }).length,
            latestSpotCheckRecord: latestRecord,
            spotCheckStatus: sortedRecords.length > 0 ? "Completed" : "Pending",
            equipmentStatus: equipmentStatus,
            lastSpotCheckDate: latestRecord?.date,
          }));
        }

        // Fetch quarterly spot checks
       const quarterlyRes = await API.get("/api/quarterly-spot-check/my").then(res => res.data);

        console.log("Quarterly API Response:", quarterlyRes); // Debug log
        
        if (quarterlyRes) {
          let records = [];
          
          if (quarterlyRes.data && Array.isArray(quarterlyRes.data)) {
            records = quarterlyRes.data;
          } else if (quarterlyRes.records && Array.isArray(quarterlyRes.records)) {
            records = quarterlyRes.records;
          } else if (Array.isArray(quarterlyRes)) {
            records = quarterlyRes;
          }
          
          console.log("Processed Quarterly Records:", records); // Debug log
          
          const sortedQuarterly = records.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          const latestQuarterly = sortedQuarterly[0] || null;
          const quarterlyEquipmentStatus = calculateEquipmentStatus(latestQuarterly);
          
          // Check if quarterly spot check is due
          const quarterlyDueCheck = checkQuarterlySpotCheckDue(latestQuarterly?.date);
          setQuarterlySpotCheckAlert(quarterlyDueCheck);
          
          setDashboardData(prev => ({
            ...prev,
            quarterlySpotCheckRecords: sortedQuarterly,
            quarterlySpotCheckTotal: sortedQuarterly.filter(r => {
              if (!r.date) return false;
              const recordDate = new Date(r.date);
              const forteen = new Date();
              forteen.setDate(forteen.getDate() - 14);
              return recordDate >= forteen;
            }).length,
            latestQuarterlySpotCheckRecord: latestQuarterly || null,
            quarterlySpotCheckStatus: sortedQuarterly.length > 0 ? "Completed" : "Pending",
            quarterlyEquipmentStatus: quarterlyEquipmentStatus,
            lastQuarterlySpotCheckDate: latestQuarterly?.date,
            loading: false,
          }));
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const quickActions = [
    { title: "Attendance List", icon: "fa-user-check", color: engroColors.primary, route: "/attendance-list", description: "Manage attendance" },
    { title: "Safety Talk (Labours)", icon: "fa-hard-hat", color: engroColors.secondary, route: "/safety-talk-list", description: "Safety briefings" },
    { title: "Safety Talk (Truckers)", icon: "fa-truck", color: engroColors.info, route: "/safety-talk-trucker-list", description: "Trucker safety" },
    { title: "Weekly Spot Check", icon: "fa-clipboard-check", color: engroColors.success, route: "/weekly-spot-check-list", description: "Weekly audits" },
    { title: "Quarterly Spot Check", icon: "fa-calendar-alt", color: engroColors.warning, route: "/quarterly-spot-check-list", description: "Quarterly audits" },
    { title: "Empty Bag Record", icon: "fa-box-open", color: engroColors.danger, route: "/empty-bag-list", description: "Inventory management" },
    { title: "Pre-numbered Stationary", icon: "fa-file-alt", color: "#8b5cf6", route: "/pre-number-stationary-record-list", description: "Document control" },
  ];

  const StatCard = ({ title, value, subtitle, icon, color, secondaryValue, onClick }) => (
    <div 
      className="stat-card" 
      style={{
        backgroundColor: engroColors.white,
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        borderLeft: `5px solid ${color}`,
        position: "relative",
        overflow: "hidden",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <div className="stat-bg" style={{
        position: "absolute",
        top: "-10px",
        right: "-10px",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        backgroundColor: `${color}15`,
      }}></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ margin: "0", color: engroColors.neutral, fontSize: "14px", fontWeight: "500", textTransform: "uppercase" }}>
          {title}
        </h3>
        <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: color }}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
      <p style={{ margin: "0", fontSize: "32px", fontWeight: "700", color: engroColors.dark, lineHeight: "1.2" }}>
        {value}
      </p>
      {secondaryValue && <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: engroColors.neutral, fontWeight: "500" }}>{secondaryValue}</p>}
      <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: engroColors.neutral, fontWeight: "500" }}>
        {subtitle}
      </p>
    </div>
  );

  const QuickActionButton = ({ action }) => (
    <button
      className="quick-action-btn"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: engroColors.light,
        border: `1px solid ${engroColors.light}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: "120px",
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = action.color;
        e.target.style.color = "white";
        e.target.style.transform = "translateY(-3px)";
        e.target.style.boxShadow = `0 6px 15px ${action.color}30`;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = engroColors.light;
        e.target.style.color = "inherit";
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "none";
      }}
      onClick={() => navigate(action.route)}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: action.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: "12px", fontSize: "20px" }}>
        <i className={`fas ${action.icon}`}></i>
      </div>
      <span style={{ fontWeight: "600", color: "inherit", fontSize: "14px", textAlign: "center", marginBottom: "4px" }}>
        {action.title}
      </span>
      <span style={{ fontSize: "12px", color: "inherit", opacity: 0.9, textAlign: "center" }}>
        {action.description}
      </span>
    </button>
  );

  const getAlertColor = (severity) => {
    switch(severity) {
      case "high": return engroColors.danger;
      case "medium": return engroColors.warning;
      case "low": return engroColors.info;
      default: return engroColors.neutral;
    }
  };

  if (dashboardData.loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: engroColors.lightGray, alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ width: "60px", height: "60px", border: `4px solid ${engroColors.light}`, borderTop: `4px solid ${engroColors.primary}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
          <h3 style={{ color: engroColors.dark, margin: "0 0 8px 0" }}>Loading Dashboard</h3>
          <p style={{ color: engroColors.neutral, margin: 0 }}>Preparing your dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: engroColors.lightGray }}>
      <Sidebar onLogout={handleLogout} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} engroColors={engroColors} />
      
      <div style={{ flex: 1, padding: "32px", marginLeft: isCollapsed ? "80px" : "280px", transition: "margin-left 0.3s ease" }}>
        
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "20px", borderBottom: `2px solid ${engroColors.light}` }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: engroColors.dark, margin: "0 0 6px 0" }}>Engro Operations Dashboard</h1>
            <p style={{ margin: "0", fontSize: "18px", fontWeight: "500", color: engroColors.dark, lineHeight: "1.4" }}>
              <span style={{ fontWeight: "700", color: engroColors.primary }}>{getGreeting()}, {user?.name}!</span>{" "}
              <span style={{ color: engroColors.neutral, fontSize: "16px" }}>Overview as of {formattedDate}</span>
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontWeight: "600", color: engroColors.dark, fontSize: "14px" }}>{user?.name}</span>
              <span style={{ color: engroColors.neutral, fontSize: "12px" }}>{user?.role || "Manager"} • {user?.warehouse?.name}</span>
              <span style={{ color: engroColors.primary, fontSize: "12px", fontWeight: "600", marginTop: "4px" }}>
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
              </span>
            </div>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: engroColors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "600", fontSize: "20px", border: `3px solid ${engroColors.light}` }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Alerts Section */}
        <div style={{ marginBottom: "24px" }}>
          {/* Weekly Spot Check Alert */}
          {spotCheckAlert && (
            <div style={{
              backgroundColor: `${getAlertColor(spotCheckAlert.severity)}15`,
              border: `2px solid ${getAlertColor(spotCheckAlert.severity)}`,
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: getAlertColor(spotCheckAlert.severity),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                }}>
                  <i className={
                    spotCheckAlert.severity === "high" ? "fas fa-exclamation-triangle" :
                    spotCheckAlert.severity === "medium" ? "fas fa-exclamation-circle" :
                    "fas fa-info-circle"
                  }></i>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: engroColors.dark, fontWeight: "600" }}>
                    Weekly Spot Check
                  </h3>
                  <p style={{ margin: "0", fontSize: "14px", color: engroColors.neutral }}>
                    {spotCheckAlert.message}
                  </p>
                </div>
              </div>
              <button
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  backgroundColor: engroColors.primary,
                  color: "white",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onClick={() => navigate("/weekly-spot-check-list")}
              >
                {spotCheckAlert.due ? "Add New Check" : "View Details"}
              </button>
            </div>
          )}

          {/* Quarterly Spot Check Alert */}
          {quarterlySpotCheckAlert && (
            <div style={{
              backgroundColor: `${getAlertColor(quarterlySpotCheckAlert.severity)}15`,
              border: `2px solid ${getAlertColor(quarterlySpotCheckAlert.severity)}`,
              borderRadius: "10px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: getAlertColor(quarterlySpotCheckAlert.severity),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                }}>
                  <i className={
                    quarterlySpotCheckAlert.severity === "high" ? "fas fa-calendar-exclamation" :
                    quarterlySpotCheckAlert.severity === "medium" ? "fas fa-calendar-check" :
                    "fas fa-calendar-alt"
                  }></i>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: engroColors.dark, fontWeight: "600" }}>
                    Quarterly Spot Check
                  </h3>
                  <p style={{ margin: "0", fontSize: "14px", color: engroColors.neutral }}>
                    {quarterlySpotCheckAlert.message}
                  </p>
                </div>
              </div>
              <button
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  backgroundColor: engroColors.warning,
                  color: "white",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onClick={() => navigate("/quarterly-spot-check-list")}
              >
                {quarterlySpotCheckAlert.due ? "Add New Check" : "View Details"}
              </button>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          <StatCard
            title="Today's Attendance"
            value={dashboardData.attendanceToday}
            subtitle={dashboardData.attendanceToday === "Present" ? `Time In: ${formatTime12(dashboardData.todayDetails?.timeIn)}` : "No attendance marked"}
            icon="fa-user-check"
            color={dashboardData.attendanceToday === "Present" ? engroColors.primary : engroColors.danger}
          />
          
          <StatCard
            title="Safety Talks"
            value={dashboardData.safetyTalksToday}
            subtitle={dashboardData.todaySafetyTalks[0]?.topic || "No talks today"}
            icon="fa-hard-hat"
            color={dashboardData.safetyTalksToday > 0 ? engroColors.secondary : engroColors.neutral}
            secondaryValue={`By: ${dashboardData.todaySafetyTalks[0]?.conductedBy || "N/A"}`}
          />
          
          <StatCard
            title="Weekly Spot Check"
            value={dashboardData.spotCheckStatus || "Pending"}
            subtitle={`Last: ${formatDate(dashboardData.lastSpotCheckDate) || "No record"}`}
            icon="fa-clipboard-check"
            color={getConditionColor(dashboardData.spotCheckStatus)}
            secondaryValue={`Records: ${dashboardData.spotCheckTotalThisWeek || 0}`}
            onClick={() => navigate("/weekly-spot-check-list")}
          />
          
          <StatCard
            title="Quarterly Spot Check"
            value={dashboardData.quarterlySpotCheckStatus || "Pending"}
            subtitle={`Last: ${formatDate(dashboardData.lastQuarterlySpotCheckDate) || "No record"}`}
            icon="fa-calendar-alt"
            color={getConditionColor(dashboardData.quarterlySpotCheckStatus)}
            secondaryValue={`Records: ${dashboardData.quarterlySpotCheckTotal || 0}`}
            onClick={() => navigate("/quarterly-spot-check-list")}
          />
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: engroColors.white, borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", marginBottom: "32px" }}>
          <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: engroColors.dark, display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-bolt" style={{ color: engroColors.primary }}></i> Quick Actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {quickActions.map((action, index) => (
              <QuickActionButton key={index} action={action} />
            ))}
          </div>
        </div>

        {/* Spot Checks Status */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          {/* Weekly Spot Check Details */}
          {dashboardData.latestSpotCheckRecord && (
            <div style={{ backgroundColor: engroColors.white, borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
              <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: engroColors.dark, display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fas fa-clipboard-check" style={{ color: engroColors.primary }}></i> Latest Weekly Check
              </h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <div style={{ textAlign: "center", padding: "16px", backgroundColor: engroColors.light, borderRadius: "8px" }}>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: engroColors.dark, marginBottom: "4px" }}>
                    {formatDate(dashboardData.latestSpotCheckRecord.date)}
                  </div>
                  <div style={{ fontSize: "12px", color: engroColors.neutral }}>Check Date</div>
                </div>
                <div style={{ textAlign: "center", padding: "16px", backgroundColor: engroColors.light, borderRadius: "8px" }}>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: getConditionColor(dashboardData.equipmentStatus?.stitchingMachine), marginBottom: "4px" }}>
                    {dashboardData.equipmentStatus?.stitchingMachine}
                  </div>
                  <div style={{ fontSize: "12px", color: engroColors.neutral }}>Stitching Machine</div>
                </div>
              </div>
              
              <div style={{ backgroundColor: engroColors.light, borderRadius: "8px", padding: "16px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: engroColors.dark, fontWeight: "600" }}>
                  <i className="fas fa-exclamation-circle" style={{ color: engroColors.warning, marginRight: "8px" }}></i>
                  Equipment Status
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: getConditionColor(dashboardData.equipmentStatus?.weighingScale) }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>Weighing Scale: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.equipmentStatus?.weighingScale}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: getConditionColor(dashboardData.equipmentStatus?.upsBattery) }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>UPS Battery: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.equipmentStatus?.upsBattery}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: getConditionColor(dashboardData.equipmentStatus?.medicine) }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>Medicine: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.equipmentStatus?.medicine}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: engroColors.info }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>Fire Ext: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.equipmentStatus?.fireExtinguishers || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quarterly Spot Check Details */}
          {dashboardData.latestQuarterlySpotCheckRecord && (
            <div style={{ backgroundColor: engroColors.white, borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
              <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: engroColors.dark, display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fas fa-calendar-alt" style={{ color: engroColors.warning }}></i> Latest Quarterly Check
              </h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <div style={{ textAlign: "center", padding: "16px", backgroundColor: engroColors.light, borderRadius: "8px" }}>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: engroColors.dark, marginBottom: "4px" }}>
                    {formatDate(dashboardData.latestQuarterlySpotCheckRecord.date)}
                  </div>
                  <div style={{ fontSize: "12px", color: engroColors.neutral }}>Check Date</div>
                </div>
                <div style={{ textAlign: "center", padding: "16px", backgroundColor: engroColors.light, borderRadius: "8px" }}>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: dashboardData.quarterlyEquipmentStatus?.safetyRamp > 2 ? engroColors.success : engroColors.warning, marginBottom: "4px" }}>
                    {dashboardData.quarterlyEquipmentStatus?.safetyRamp || 0}/5
                  </div>
                  <div style={{ fontSize: "12px", color: engroColors.neutral }}>Safety Ramp (Good)</div>
                </div>
              </div>
              
              <div style={{ backgroundColor: engroColors.light, borderRadius: "8px", padding: "16px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: engroColors.dark, fontWeight: "600" }}>
                  <i className="fas fa-shield-alt" style={{ color: engroColors.success, marginRight: "8px" }}></i>
                  Safety Equipment Status
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: dashboardData.quarterlyEquipmentStatus?.srlHarness > 2 ? engroColors.success : engroColors.warning }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>SRL Harness: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.quarterlyEquipmentStatus?.srlHarness || 0}/5 Good</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: dashboardData.quarterlyEquipmentStatus?.verifiedBy === "Verified" ? engroColors.success : engroColors.warning }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>Verified By: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.quarterlyEquipmentStatus?.verifiedBy}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: engroColors.info }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>Total Fire Ext: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.quarterlyEquipmentStatus?.fireExtinguishers || 0}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: getConditionColor(dashboardData.quarterlyEquipmentStatus?.medicine) }}></div>
                    <span style={{ fontSize: "14px", color: engroColors.neutral }}>Medicine: </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: engroColors.dark }}>{dashboardData.quarterlyEquipmentStatus?.medicine}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Today's Records */}
        <div style={{ backgroundColor: engroColors.white, borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}>
          <h2 style={{ margin: "0 0 20px 0", fontSize: "20px", color: engroColors.dark, display: "flex", alignItems: "center", gap: "10px" }}>
            <i className="fas fa-clipboard-list" style={{ color: engroColors.primary }}></i> Today's Records
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {/* Empty Bag Records */}
            <div style={{ backgroundColor: engroColors.light, borderRadius: "10px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: `${engroColors.danger}15`, display: "flex", alignItems: "center", justifyContent: "center", color: engroColors.danger, fontSize: "18px", marginRight: "12px" }}>
                  <i className="fas fa-box-open"></i>
                </div>
                <h3 style={{ margin: "0", fontSize: "16px", color: engroColors.dark, fontWeight: "600" }}>
                  Empty Bag Records ({dashboardData.emptyBagTotalToday || 0})
                </h3>
              </div>
              {dashboardData.emptyBagTotalToday > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {dashboardData.emptyBagRecords.slice(0, 10).map((record, index) => (
                    <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: engroColors.white, borderRadius: "8px" }}>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>{record.product}</p>
                        <p style={{ margin: "0", fontSize: "12px", color: engroColors.neutral }}>Balance: {record.balanceQty}</p>
                      </div>
                      <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "12px", backgroundColor: `${getDOStatusColor(record.doVerified)}15`, color: getDOStatusColor(record.doVerified), fontWeight: "600" }}>
                        {record.doVerified}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: "0", color: engroColors.neutral, fontSize: "14px", textAlign: "center", padding: "20px 0" }}>No records today</p>
              )}
            </div>
            {/* Pre-number Records */}
            <div style={{ backgroundColor: engroColors.light, borderRadius: "10px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: `#8b5cf615`, display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", fontSize: "18px", marginRight: "12px" }}>
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 style={{ margin: "0", fontSize: "16px", color: engroColors.dark, fontWeight: "600" }}>
                  Pre-number Stationary ({dashboardData.preNumberTotalToday || 0})
                </h3>
              </div>
              {dashboardData.preNumberTotalToday > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {dashboardData.preNumberRecords.slice(0, 10).map((record, index) => (
                    <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: engroColors.white, borderRadius: "8px" }}>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>Book #{record.bookNo}</p>
                        <p style={{ margin: "0", fontSize: "12px", color: engroColors.neutral }}>{record.purpose?.substring(0, 25)}...</p>
                      </div>
                      <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "12px", backgroundColor: `${getDOStatusColor(record.doVerified)}15`, color: getDOStatusColor(record.doVerified), fontWeight: "600" }}>
                        {record.doVerified}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: "0", color: engroColors.neutral, fontSize: "14px", textAlign: "center", padding: "20px 0" }}>No records today</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
}