import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerHospital = async (hospitalData) => {
  const response = await api.post("/hospitals/register", hospitalData);

  return response.data;
};
