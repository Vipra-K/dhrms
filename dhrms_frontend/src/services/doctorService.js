import api from "./api";

export const getDoctors = async () => {
  const response = await api.get("/hospitals/doctors");

  return response.data;
};

export const createDoctor = async (doctor) => {
  const response = await api.post("/hospitals/doctors", doctor);

  return response.data;
};

export const updateDoctor = async (doctorId, doctor) => {
  const response = await api.put(`/hospitals/doctors/${doctorId}`, doctor);

  return response.data;
};

export const activateDoctor = async (doctorId) => {
  const response = await api.patch(`/hospitals/doctors/${doctorId}/activate`);

  return response.data;
};

export const suspendDoctor = async (doctorId) => {
  const response = await api.patch(`/hospitals/doctors/${doctorId}/suspend`);

  return response.data;
};

export const deactivateDoctor = async (doctorId) => {
  const response = await api.patch(`/hospitals/doctors/${doctorId}/deactivate`);

  return response.data;
};

export const getMyDoctorProfile = async () => {
  const response = await api.get("/doctors/me");

  return response.data;
};

export const getHospitalDoctors = async () => {
  const response = await api.get("/hospitals/doctors");

  return response.data;
};

export const getMyWorkers = async () => {
  const response = await api.get("/doctors/me/workers");

  return response.data;
};
