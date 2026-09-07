const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const request = async (method, path, body) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) data = await response.json();
  else if (response.status !== 204) data = await response.text();

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
    error.response = { status: response.status, data };
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.assign("/login?reason=session-expired");
    }
    throw error;
  }

  return { data, status: response.status };
};

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export const getApiError = (error, fallback = "Something went wrong.") => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || error?.response?.data?.error || error?.message || fallback;
};

export default api;
