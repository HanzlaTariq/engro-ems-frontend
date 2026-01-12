// utils/api.js
import axios from "axios";

// Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL); // Add this

// Request interceptor - token attach karega
API.interceptors.request.use(
  (config) => {
    // Admin token pehle, fir normal user token
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 401 (unauthorized) pe auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      window.location.href = "/login"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default API;


