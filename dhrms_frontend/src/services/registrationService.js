import api from "./api";

export const registerWorker = async (worker) => (await api.post("/registration/workers", worker)).data;
