// api/axios.jsx

import axios from "axios";
import { attachRetry } from "../utils/retry";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // Bearer token use hota hai, cookies nahi
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Network blip / cold start par sirf GET requests dobara try hongi
attachRetry(api);

export default api;
