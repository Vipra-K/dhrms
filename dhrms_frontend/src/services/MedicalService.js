import api from "./api";

export const getMedicalRecords = async (workerId) => (await api.get(`/doctors/me/workers/${workerId}/medical-records`)).data;
export const createMedicalRecord = async (workerId, data) => (await api.post(`/doctors/me/workers/${workerId}/medical-records`, data)).data;
export const updateMedicalRecord = async (recordId, data) => (await api.put(`/doctors/me/medical-records/${recordId}`, data)).data;
export const createPrescription = async (recordId, data) => (await api.post(`/doctors/me/medical-records/${recordId}/prescriptions`, data)).data;
export const updatePrescription = async (prescriptionId, data) => (await api.put(`/doctors/me/prescriptions/${prescriptionId}`, data)).data;
