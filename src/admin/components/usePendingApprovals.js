import { useEffect, useRef, useState, useCallback } from "react";
import API from "../../utils/api.js";

// Admin ke approval ke muntazir records ki live ginti (har 30s refresh + tab me wapas aane par).
// Naya request aane par browser tab ka title bhi "(N) ..." ho jata hai taake admin ko pata chal jaye.
export const PENDING_ROUTE = {
  attendance: "/admin/manage-attendance",
  safetyTalk: "/admin/manage-safety-talk",
  safetyTalkTrucker: "/admin/manage-safety-talk-trucker",
  emptyBag: "/admin/manage-empty-bags",
  preStationary: "/admin/manage-pre-stationary-record",
  weeklySpotCheck: "/admin/weekly-reports",
  quarterlySpotCheck: "/admin/quarterly-reports",
};

// Admin ke verify (PUT/PATCH) ya revert (DELETE) ke foran baad badge refresh ho (30s intezar nahi)
let interceptorAttached = false;
if (!interceptorAttached && API?.interceptors?.response) {
  interceptorAttached = true;
  API.interceptors.response.use((res) => {
    const m = (res.config?.method || "").toLowerCase();
    if (["put", "patch", "delete"].includes(m) && sessionStorage.getItem("adminToken")) {
      window.dispatchEvent(new Event("pending-approvals:refresh"));
    }
    return res;
  });
}

export default function usePendingApprovals(intervalMs = 30000) {
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const baseTitle = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;
      const res = await API.get("/api/dashboard-stats/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCounts(res.data.counts || {});
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Pending approvals fetch error:", err.response?.data || err.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    // Dusre page (e.g. approve/revert ke baad) se turant refresh ke liye
    window.addEventListener("pending-approvals:refresh", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pending-approvals:refresh", onFocus);
    };
  }, [refresh, intervalMs]);

  useEffect(() => {
    if (baseTitle.current === null) baseTitle.current = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = total > 0 ? `(${total}) ${baseTitle.current}` : baseTitle.current;
    return () => {
      if (baseTitle.current !== null) document.title = baseTitle.current;
    };
  }, [total]);

  return { counts, total, refresh };
}
