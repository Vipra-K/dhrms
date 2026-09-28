import api from "./api";

export const getAdminAnalytics = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, value);
  });
  const query = params.toString();
  const response = await api.get("/admin/analytics" + (query ? "?" + query : ""));
  return response.data;
};
