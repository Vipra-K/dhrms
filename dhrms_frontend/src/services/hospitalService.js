import api from "./api";

export const getHospitalDashboard = async () => (await api.get("/hospitals/me/dashboard")).data;
