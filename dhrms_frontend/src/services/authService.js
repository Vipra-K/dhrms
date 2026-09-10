import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const getCurrentSession = async () => {
  const response = await api.get("/auth/session");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const registerHospital = async (hospitalData) => {
  const response = await api.post("/hospitals/register", hospitalData);

  return response.data;
};
