// utils/retry.js
// Vercel serverless par kabhi kabhi pehli request cold start / network blip ki wajah se fail hoti hai.
// Ye helper SIRF safe requests dobara try karta hai:
//   - GET requests
//   - login requests (dobara bhejna safe hai)
// POST/PUT/DELETE (data banane/badalne wali) requests kabhi auto-retry nahi hoti,
// taake record do baar na ban jaye.

const RETRY_STATUS = new Set([502, 503, 504]);

const isLoginUrl = (url = "") =>
  url.includes("/api/auth/login") || url.includes("/api/admin/login");

export function attachRetry(instance, { retries = 2, baseDelay = 800 } = {}) {
  instance.interceptors.response.use(undefined, async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const method = (config.method || "get").toLowerCase();
    const retryable = method === "get" || isLoginUrl(config.url);

    const noResponse = !error.response; // network error / timeout
    const serverBusy = error.response && RETRY_STATUS.has(error.response.status);

    config.__retryCount = config.__retryCount || 0;

    if (retryable && (noResponse || serverBusy) && config.__retryCount < retries) {
      config.__retryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, baseDelay * config.__retryCount));
      return instance(config);
    }

    return Promise.reject(error);
  });
}

// Login screens ke liye user-friendly error text
export function getLoginErrorMessage(err, fallback) {
  if (err?.response?.data?.msg || err?.response?.data?.message) {
    return err.response.data.msg || err.response.data.message;
  }
  if (err?.code === "ECONNABORTED" || err?.request) {
    return "Server is not responding right now. Please wait a few seconds and try again.";
  }
  return fallback;
}
