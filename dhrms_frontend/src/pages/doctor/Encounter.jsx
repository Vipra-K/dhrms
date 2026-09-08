import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import MedicalRecords from "./MedicalRecords";
import "./medical-records.css";
import { getDoctorEncounter, completeEncounter } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const Encounter = () => {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  const load = async () => {
    try { setError(""); setEncounter(await getDoctorEncounter(encounterId)); }
    catch (err) { setError(getApiError(err, "Unable to load this visit.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [encounterId]);

  const finish = async () => {
    if (!window.confirm("Complete this visit? The doctor-worker relationship will end, while the medical history remains available.")) return;
    setCompleting(true); setError("");
    try { await completeEncounter(encounterId); navigate("/doctor/workers", { replace: true }); }
    catch (err) { setError(getApiError(err, "Unable to complete the visit.")); }
    finally { setCompleting(false); }
  };

  return <RoleLayout title="Current visit" description="This doctor-worker relationship exists only for the active encounter.">
    {loading && <div className="loading-card">Loading visit…</div>}
    {error && <div className="alert error">{error}</div>}
    {encounter && <>
      <div className="card worker-profile-header"><div className="person-cell"><span className="avatar">{(encounter.workerName || "W").charAt(0)}</span><div><span className="eyebrow">Worker ID {encounter.workerCode}</span><h2>{encounter.workerName}</h2><p>{encounter.hospitalName} · {encounter.doctorName}</p></div></div><span className={`status-badge ${encounter.status === "ACTIVE" ? "status-active" : "status-inactive"}`}>{encounter.status}</span></div>
      <div className="profile-grid"><div><small>Started</small><strong>{new Date(encounter.startedAt).toLocaleString()}</strong></div><div><small>Doctor</small><strong>{encounter.doctorName}</strong></div><div><small>Specialization</small><strong>{encounter.doctorSpecialization || "—"}</strong></div><div><small>Hospital</small><strong>{encounter.hospitalName}</strong></div></div>
      {encounter.status === "ACTIVE" ? <><MedicalRecords workerId={String(encounter.workerId)} encounterId={String(encounter.id)} /><div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Finish care</span><h2>Complete this visit</h2><p>Only complete the encounter after the current consultation and required clinical documentation are finished.</p></div><button className="button button-primary" onClick={finish} disabled={completing}>{completing ? "Completing…" : "Complete visit"}</button></div></div></> : <div className="empty-state-card"><h3>This visit is complete</h3><p>The relationship is closed. The medical history remains part of the worker's record.</p></div>}
    </>}
  </RoleLayout>;
};
export default Encounter;
