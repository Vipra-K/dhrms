import api from "./api";

export const getWorkers = async () => (await api.get("/hospitals/workers")).data;
export const getWorker = async (workerId) => (await api.get(`/hospitals/workers/${workerId}`)).data;
export const getWorkerByCode = async (workerCode) => (await api.get(`/hospitals/workers/code/${encodeURIComponent(workerCode)}`)).data;
export const createWorker = async (worker) => (await api.post("/hospitals/workers", worker)).data;
export const updateWorker = async (workerId, worker) => (await api.put(`/hospitals/workers/${workerId}`, worker)).data;
export const activateWorker = async (workerId) => (await api.patch(`/hospitals/workers/${workerId}/activate`)).data;
export const deactivateWorker = async (workerId) => (await api.patch(`/hospitals/workers/${workerId}/deactivate`)).data;
export const generateWorkerQr = async (workerId) => (await api.post(`/hospitals/workers/${workerId}/qr`)).data;
export const viewWorkerQr = async (workerId) => (await api.get(`/hospitals/workers/${workerId}/qr`)).data;
export const lookupWorkerByQr = async (qrContent) => (await api.post("/hospitals/workers/qr/lookup", { qrContent })).data;
export const getWorkerAssignment = async (workerId) => (await api.get(`/hospitals/workers/${workerId}/assignment`)).data;
export const getWorkerAssignmentHistory = async (workerId) => (await api.get(`/hospitals/workers/${workerId}/assignment/history`)).data;
export const assignWorkerToDoctor = async (workerId, doctorId) => (await api.post(`/hospitals/workers/${workerId}/assignment`, { doctorId })).data;
export const getMyWorker = async (workerId) => (await api.get(`/doctors/me/workers/${workerId}`)).data;
export const getMyWorkerProfile = async () => (await api.get("/workers/me")).data;
export const updateMyWorkerProfile = async (worker) => (await api.put("/workers/me", worker)).data;
export const getMyWorkerMedicalRecords = async () => (await api.get("/workers/me/medical-records")).data;
