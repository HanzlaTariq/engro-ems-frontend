import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaBell, FaXmark, FaTriangleExclamation } from "react-icons/fa6";
import API from "../utils/api";

// Persistent dashboard notification bell.
// Notifications are fetched from the backend and stay visible until the
// user explicitly dismisses them by clicking the cross (×) — they are
// never auto-hidden just because time passed or the page refreshed.
export default function NotificationBell({ engroColors }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const colors = engroColors || {
    primary: "#00A859",
    dark: "#1D3F36",
    neutral: "#4A4A4A",
    danger: "#EF4444",
    light: "#F0F7F4",
    white: "#FFFFFF",
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await API.get("/api/notifications/my");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.response?.data || err.message);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s so a revert shows up without requiring a manual refresh
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dismiss = async (id) => {
    // Optimistic UI: remove immediately, revert on failure
    const prev = notifications;
    setNotifications((list) => list.filter((n) => n._id !== id));
    try {
      await API.put(`/api/notifications/dismiss/${id}`);
    } catch (err) {
      console.error("Failed to dismiss notification:", err.response?.data || err.message);
      setNotifications(prev);
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const count = notifications.length;

  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        style={{
          position: "relative",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: `2px solid ${colors.light}`,
          backgroundColor: colors.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: colors.dark,
          fontSize: "18px",
        }}
      >
        <FaBell />
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              backgroundColor: colors.danger,
              color: "white",
              borderRadius: "50%",
              minWidth: "18px",
              height: "18px",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              border: "2px solid white",
            }}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "54px",
            right: 0,
            width: "360px",
            maxHeight: "420px",
            overflowY: "auto",
            backgroundColor: colors.white,
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            border: `1px solid ${colors.light}`,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${colors.light}`,
              fontWeight: "700",
              color: colors.dark,
              fontSize: "15px",
            }}
          >
            Notifications {count > 0 ? `(${count})` : ""}
          </div>

          {count === 0 ? (
            <div
              style={{
                padding: "24px 16px",
                textAlign: "center",
                color: colors.neutral,
                fontSize: "14px",
              }}
            >
              No new notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${colors.light}`,
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    backgroundColor: `${colors.danger}18`,
                    color: colors.danger,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "14px",
                  }}
                >
                  <FaTriangleExclamation />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      color: colors.dark,
                      fontSize: "13px",
                      marginBottom: "2px",
                    }}
                  >
                    {n.title}
                  </div>
                  <div style={{ fontSize: "12.5px", color: colors.neutral, lineHeight: "1.4" }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: "11px", color: colors.neutral, marginTop: "6px" }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => dismiss(n._id)}
                  title="Dismiss"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: colors.neutral,
                    fontSize: "14px",
                    padding: "4px",
                    lineHeight: 1,
                  }}
                >
                  <FaXmark />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
