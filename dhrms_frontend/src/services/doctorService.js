import api from "./api";

export const getDoctors = async () => (await api.get("/hospitals/doctors")).data;
export const getDoctor = async (doctorId) => (await api.get(`/hospitals/doctors/${doctorId}`)).data;
export const createDoctor = async (doctor) => (await api.post("/hospitals/doctors", doctor)).data;
export const updateDoctor = async (doctorId, doctor) => (await api.put(`/hospitals/doctors/${doctorId}`, doctor)).data;
export const activateDoctor = async (doctorId) => (await api.patch(`/hospitals/doctors/${doctorId}/activate`)).data;
export const suspendDoctor = async (doctorId) => (await api.patch(`/hospitals/doctors/${doctorId}/suspend`)).data;
export const deactivateDoctor = async (doctorId) => (await api.patch(`/hospitals/doctors/${doctorId}/deactivate`)).data;
export const getMyDoctorProfile = async () => (await api.get("/doctors/me")).data;
export const getHospitalDoctors = async () => (await api.get("/hospitals/doctors")).data;
export const getMyWorkers = async () => (await api.get("/doctors/me/workers")).data;
