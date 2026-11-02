// utils/api.js
import axios from "axios";
import { attachRetry } from "./retry";

// Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // cookies use nahi ho rahi (Bearer token hai) -> false behtar hai
  timeout: 25000, // cold start ke liye kaafi, lekin hamesha ke liye hang nahi
  headers: {
    "Content-Type": "application/json",
  },
});

// Network blip / cold start par GET aur login dobara try hoga
attachRetry(API);

// Request interceptor - token attach karega
API.interceptors.request.use(
  (config) => {
    // Admin token pehle, fir normal user token
    const token = sessionStorage.getItem("adminToken") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const isLoginRequest = (url = "") =>
  url.includes("/api/auth/login") || url.includes("/api/admin/login");

// Response interceptor - token invalid/expire (401) par auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Login ka galat password bhi 401 de sakta hai — us waqt page reload/redirect NAHI karna,
    // warna user ko error message nazar hi nahi aata tha ("login nahi hota" ki ek wajah).
    if (status === 401 && !isLoginRequest(url)) {
      const onAdminPage = window.location.pathname.startsWith("/admin");

      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminData");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      const target = onAdminPage ? "/admin/login" : "/login";
      if (window.location.pathname !== target) {
        window.location.href = target;
      }
    }
    return Promise.reject(error);
  }
);

export default API;
