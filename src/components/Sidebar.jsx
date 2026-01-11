import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ onLogout, isCollapsed, setIsCollapsed }) {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    // Engro color scheme
    const engroColors = {
        primary: "#00A859", // Engro Green
        secondary: "#FF671F", // Engro Orange
        dark: "#1D3F36", // Dark Green
        light: "#F0F7F4", // Light Green
        neutral: "#4A4A4A", // Dark Gray
        sidebarBg: "#1D3F36", // Dark Green for sidebar
        sidebarHover: "#2A5247", // Darker Green for hover
        white: "#FFFFFF"
    };

    // Navigation items
    const navItems = [
        {
            path: "/dashboard",
            name: "Dashboard",
            icon: "fa-tachometer-alt",
            description: "Overview"
        },
        {
            path: "/attendance",
            name: "WHI Attendance Register",
            icon: "fa-user-check",
            description: "Worker Attendance"
        },
        {
            path: "/safety-talk",
            name: "Safety Talk Record (With Labours)",
            icon: "fa-hard-hat",
            description: "Labour Safety"
        },
        {
            path: "/empty-bag-record",
            name: "Empty Bag Record",
            icon: "fa-box-open",
            description: "Inventory"
        },
        {
            path: "/safety-talk-trucker",
            name: "Safety Talk Record (With Truckers)",
            icon: "fa-truck-moving",
            description: "Trucker Safety"
        },
       
       
        {
           path: "/weekly-spot-check",
            name: "Weekly Spot Check",
            icon: "fa-clipboard-check",
            description: "Safety Inspection"
        },
        {
            path: "/quarterly-spot-check",
            name: "Quarterly spot check",
            icon: " fa-clipboard-check",
            description: "Quarterly spot check"
        },
         {
            path: "/pre-number-stationary-record",
            name: "PreNumber Stationary Record",
            icon: "fa-file-alt",
            description: "Stationary Record"
        }

    ];

    return (
        <div style={{
            width: isCollapsed ? "80px" : "280px",
            height: "100vh", 
            position: "fixed",
            left: 0,
            top: 0,
            padding: "20px 0",
            background: engroColors.sidebarBg,
            color: engroColors.white,
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
            transition: "width 0.3s ease",
            overflow: "hidden"
        }}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "-15px",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `2px solid ${engroColors.white}`,
                    background: engroColors.primary,
                    color: engroColors.white,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    zIndex: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = engroColors.secondary;
                    e.target.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = engroColors.primary;
                    e.target.style.transform = "scale(1)";
                }}
            >
                <i className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
            </button>

            {/* Logo Section */}
            <div style={{
                padding: "0 24px 20px",
                borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
                textAlign: isCollapsed ? "center" : "left"
            }}>
                {!isCollapsed ? (
                    <>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px"
                        }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                background: engroColors.primary,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: "20px"
                            }}>
                                E
                            </div>
                            <div>
                                <h3 style={{
                                    margin: "0",
                                    fontSize: "18px",
                                    fontWeight: "700",
                                    color: engroColors.white
                                }}>
                                    Engro Fertilizers
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: "12px",
                                    color: "rgba(255, 255, 255, 0.7)"
                                }}>
                                    Operations Dashboard
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 12px",
                            background: "rgba(0, 168, 89, 0.2)",
                            borderRadius: "6px",
                            marginTop: "8px"
                        }}>
                            <span style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#10B981",
                                display: "inline-block"
                            }}></span>
                            <span style={{
                                fontSize: "12px",
                                color: "rgba(255, 255, 255, 0.9)"
                            }}>Operational • {user?.role|| "warehouse_manager"}</span>
                        </div>
                    </>
                ) : (
                    <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: engroColors.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "20px",
                        margin: "0 auto"
                    }}>
                        E
                    </div>
                )}
            </div>

            {/* User Profile Section */}
            <div style={{
                padding: "20px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                borderBottom: `1px solid rgba(255, 255, 255, 0.1)`
            }}>
                <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: `linear-gradient(135deg, ${engroColors.primary} 0%, ${engroColors.secondary} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    fontSize: "18px",
                    color: engroColors.white
                }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                    <div style={{ overflow: "hidden" }}>
                        <p style={{
                            margin: "0 0 4px 0",
                            fontWeight: "600",
                            fontSize: "15px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {user?.name}
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "rgba(255, 255, 255, 0.7)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {user?.email || "Operations Manager"}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{
                flex: 1,
                padding: "16px 0",
                overflowY: "scroll",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
            }}>
                <div style={{ padding: "0 8px" }}>
                    {!isCollapsed && (
                        <p style={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "11px",
                            fontWeight: "600",
                            margin: "0 0 12px 16px",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            Plant Operations
                        </p>
                    )}

                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: isCollapsed ? "0" : "12px",
                                    padding: "14px 16px",
                                    borderRadius: "8px",
                                    color: isActive ? engroColors.white : "rgba(255, 255, 255, 0.8)",
                                    textDecoration: "none",
                                    backgroundColor: isActive ? engroColors.primary : "transparent",
                                    margin: "0 8px 6px 8px",
                                    transition: "all 0.2s ease",
                                    fontWeight: isActive ? "600" : "400",
                                    justifyContent: isCollapsed ? "center" : "flex-start",
                                    border: isActive ? `1px solid rgba(255, 255, 255, 0.1)` : "1px solid transparent",
                                    position: "relative"
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.target.style.backgroundColor = engroColors.sidebarHover;
                                        e.target.style.color = engroColors.white;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.target.style.backgroundColor = "transparent";
                                        e.target.style.color = "rgba(255, 255, 255, 0.8)";
                                    }
                                }}
                            >
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "16px"
                                }}>
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                {!isCollapsed && (
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: "14px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}>
                                            {item.name}
                                        </div>
                                        <div style={{
                                            fontSize: "11px",
                                            color: "rgba(255, 255, 255, 0.6)",
                                            marginTop: "2px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis"
                                        }}>
                                            {item.description}
                                        </div>
                                    </div>
                                )}
                                {isActive && !isCollapsed && (
                                    <div style={{
                                        width: "4px",
                                        height: "20px",
                                        backgroundColor: engroColors.secondary,
                                        borderRadius: "2px"
                                    }}></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Logout Section */}
            <div style={{
                padding: "16px 16px 20px",
                borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
                textAlign: isCollapsed ? "center" : "left"
            }}>
                <button
                    onClick={onLogout}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: isHovered
                            ? `linear-gradient(135deg, ${engroColors.secondary} 0%, #DC2626 100%)`
                            : "rgba(255, 255, 255, 0.1)",
                        color: isHovered ? engroColors.white : "rgba(255, 255, 255, 0.9)",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: isCollapsed ? "0" : "8px",
                        fontSize: "14px"
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <i className="fas fa-sign-out-alt"></i>
                    {!isCollapsed && "Logout"}
                </button>

                {!isCollapsed && (
                    <div style={{
                        textAlign: "center",
                        marginTop: "16px"
                    }}>
                        <p style={{
                            color: "rgba(255, 255, 255, 0.5)",
                            fontSize: "11px",
                            margin: "8px 0 4px"
                        }}>
                            Engro Fertilizers Ltd.
                        </p>
                        <p style={{
                            color: "rgba(255, 255, 255, 0.4)",
                            fontSize: "10px",
                            margin: 0
                        }}>
                            v2.1.0 • © 2023
                        </p>
                    </div>
                )}
            </div>

            {/* Add Font Awesome for icons */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {/* Custom scrollbar styling */}
            <style>
                {`
                    nav::-webkit-scrollbar {
                        display: none;}
                    nav::-webkit-scrollbar-track {
                        background: ${engroColors.sidebarBg};
                    }
                    nav::-webkit-scrollbar-thumb {
                        background: ${engroColors.primary};
                        border-radius: 2px;
                    }
                        
                `}
            </style>
        </div>
    );
}