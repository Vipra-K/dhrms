import api from "./api";

export const startEncounter = async (workerId, doctorId) => (await api.post("/encounters", { workerId: Number(workerId), doctorId: Number(doctorId) })).data;
export const getHospitalActiveEncounters = async () => (await api.get("/encounters/hospital/active")).data;
export const getDoctorActiveEncounters = async () => (await api.get("/encounters/doctor/active")).data;
export const getDoctorEncounter = async (encounterId) => (await api.get(`/encounters/doctor/${encounterId}`)).data;
export const completeEncounter = async (encounterId) => (await api.post(`/encounters/doctor/${encounterId}/complete`)).data;
export const getWorkerEncounterHistory = async (workerId) => (await api.get(`/encounters/worker/${workerId}/history`)).data;
export const getAiWorkerHistorySummary = async (workerId) => (await api.get(`/ai/worker/${workerId}/summary`)).data;
