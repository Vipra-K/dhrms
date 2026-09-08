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

export const uploadMedicalAttachments = async (recordId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return (await api.upload(`/medical-records/${recordId}/attachments`, formData)).data;
};

export const revokeMedicalAttachment = async (attachmentId) => (await api.delete(`/medical-record-attachments/${attachmentId}`)).data;

export const openMedicalAttachment = async (attachment) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/medical-record-attachments/${attachment.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error("Unable to open attachment.");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const downloadMedicalAttachment = async (attachment) => {
  const url = await openMedicalAttachment(attachment);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
