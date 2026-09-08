const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const request = async (method, path, body) => {
  const token = localStorage.getItem("token");
  const isFormData = body instanceof FormData;
  let response;

  try {
    response = await fetch(`${baseURL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: isFormData ? body : JSON.stringify(body) }),
    });
  } catch (networkError) {
    const error = new Error("Unable to reach the server. Check your connection and try again.");
    error.code = "NETWORK_ERROR";
    error.cause = networkError;
    throw error;
  }

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
  upload: (path, formData) => request("POST", path, formData),
};

export const getApiError = (error, fallback = "Something went wrong. Please try again.") => {
  if (error?.code === "NETWORK_ERROR") return error.message;

  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  const backendMessage = Array.isArray(message) ? message.join(", ") : message || error?.response?.data?.error;

  // Preserve useful business errors (for example, an active encounter conflict)
  // while giving generic HTTP failures a user-facing explanation.
  if (backendMessage && status !== 500) return backendMessage;

  switch (status) {
    case 400: return "The request could not be completed. Check the information and try again.";
    case 401: return "Your session has expired. Please sign in again.";
    case 403: return "You do not have permission to perform this action.";
    case 404: return "The requested information could not be found.";
    case 409: return backendMessage || "This action conflicts with the current record state.";
    case 422: return "Some information is invalid. Please check the form and try again.";
    case 500: return "The server encountered a problem. Please try again later.";
    case 502:
    case 503:
    case 504: return "The service is temporarily unavailable. Please try again shortly.";
    default: return error?.message || fallback;
  }
};

export default api;
