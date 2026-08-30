import api from "./api";

export const getMedicalRecords = async (workerId) => {
  const response = await api.get(
    `/doctors/me/workers/${workerId}/medical-records`,
  );

  return response.data;
};

export const createMedicalRecord = async (workerId, data) => {
  const response = await api.post(
    `/doctors/me/workers/${workerId}/medical-records`,
    data,
  );

  return response.data;
};

export const updateMedicalRecord = async (recordId, data) => {
  const response = await api.put(
    `/doctors/me/medical-records/${recordId}`,
    data,
  );

  return response.data;
};

export const deleteMedicalRecord = async (recordId) => {
  await api.delete(`/doctors/me/medical-records/${recordId}`);
};

export const createPrescription = async (recordId, data) => {
  const response = await api.post(
    `/doctors/me/medical-records/${recordId}/prescriptions`,
    data,
  );

  return response.data;
};

export const updatePrescription = async (prescriptionId, data) => {
  const response = await api.put(
    `/doctors/me/prescriptions/${prescriptionId}`,
    data,
  );

  return response.data;
};

export const deletePrescription = async (prescriptionId) => {
  await api.delete(`/doctors/me/prescriptions/${prescriptionId}`);
};
