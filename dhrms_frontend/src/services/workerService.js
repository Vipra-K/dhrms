import api from "./api";

export const getWorkers = async () => {
  const response = await api.get("/hospitals/workers");

  return response.data;
};

export const getWorker = async (workerId) => {
  const response = await api.get(`/hospitals/workers/${workerId}`);

  return response.data;
};

export const getWorkerByCode = async (workerCode) => {
  const response = await api.get(`/hospitals/workers/code/${workerCode}`);

  return response.data;
};

export const createWorker = async (worker) => {
  const response = await api.post("/hospitals/workers", worker);

  return response.data;
};

export const updateWorker = async (workerId, worker) => {
  const response = await api.put(`/hospitals/workers/${workerId}`, worker);

  return response.data;
};

export const activateWorker = async (workerId) => {
  const response = await api.patch(`/hospitals/workers/${workerId}/activate`);

  return response.data;
};

export const deactivateWorker = async (workerId) => {
  const response = await api.patch(`/hospitals/workers/${workerId}/deactivate`);

  return response.data;
};
export const generateWorkerQr = async (workerId) => {
  const response = await api.post(`/hospitals/workers/${workerId}/qr`);

  return response.data;
};

export const lookupWorkerByQr = async (qrContent) => {
  const response = await api.post("/hospitals/workers/qr/lookup", {
    qrContent,
  });

  return response.data;
};

export const getWorkerAssignment = async (workerId) => {
  const response = await api.get(`/hospitals/workers/${workerId}/assignment`);

  return response.data;
};

export const assignWorkerToDoctor = async (workerId, doctorId) => {
  const response = await api.post(`/hospitals/workers/${workerId}/assignment`, {
    doctorId,
  });

  return response.data;
};
export const getMyWorker = async (workerId) => {
  const response = await api.get(`/doctors/me/workers/${workerId}`);

  return response.data;
};
