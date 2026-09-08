import api from "./api";

export const registerWorker = async (worker) => (await api.post("/registration/workers", worker)).data;
export const getRegisteredWorkers = async (search = "") => (await api.get("/registration/workers", { params: search ? { search } : {} })).data;
export const getRegisteredWorker = async (workerId) => (await api.get(`/registration/workers/${workerId}`)).data;
export const checkWorkerPhone = async (phone) => (await api.get("/registration/workers/check-phone", { params: { phone } })).data;
