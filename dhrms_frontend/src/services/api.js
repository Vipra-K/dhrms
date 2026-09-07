import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.assign("/login?reason=session-expired");
      }
    }
    return Promise.reject(error);
  },
);

export const getApiError = (error, fallback = "Something went wrong.") => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || error?.response?.data?.error || error?.message || fallback;
};

export default api;
