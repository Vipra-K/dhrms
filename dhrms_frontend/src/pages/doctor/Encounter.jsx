import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import MedicalRecords from "./MedicalRecords";
import "./medical-records.css";
import { completeEncounter, getAiWorkerHistorySummary, getDoctorEncounter } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const Encounter = () => {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false); const [aiLoading, setAiLoading] = useState(false); const [aiSummary, setAiSummary] = useState(null); const [aiError, setAiError] = useState("");
  const load = useCallback(async () => { try { setError(""); setLoading(true); setEncounter(await getDoctorEncounter(encounterId)); } catch (err) { setError(getApiError(err, "Unable to load this visit.")); } finally { setLoading(false); } }, [encounterId]);
  useEffect(() => { load(); }, [load]);
  const visitDate = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date()), []);
  const analyzeHistory = async () => { if (!encounter?.workerId) return; setAiLoading(true); setAiError(""); try { setAiSummary(await getAiWorkerHistorySummary(encounter.workerId)); } catch (err) { setAiError(getApiError(err, "Unable to load the history summary.")); } finally { setAiLoading(false); } };
  const finish = async () => { if (encounter?.status !== "ACTIVE") return; if (!window.confirm("Complete this visit? Make sure all clinical information is saved.")) return; setCompleting(true); setError(""); try { await completeEncounter(encounterId); navigate("/doctor/workers", { replace: true }); } catch (err) { setError(getApiError(err, "Unable to complete the visit.")); } finally { setCompleting(false); } };

  return <RoleLayout title="Visit details" description={encounter ? `${encounter.workerName} · ${encounter.hospitalName}` : "Current visit"} actions={[{ label: "Refresh", onClick: load, variant: "secondary", disabled: loading }, { label: "Back", onClick: () => navigate("/doctor/workers"), variant: "secondary" }]}>
    {loading && !encounter && <div className="loading-card">Loading visit…</div>}
    {error && <div className="alert error" role="alert">{error}</div>}
    {encounter && <>
      <div className="card worker-profile-header"><div className="person-cell"><span className="avatar">{(encounter.workerName || "W").charAt(0)}</span><div><span className="eyebrow">{encounter.workerCode}</span><h2>{encounter.workerName}</h2><p>{encounter.hospitalName}</p></div></div><span className={`status-badge ${encounter.status === "ACTIVE" ? "status-active" : "status-inactive"}`}>{encounter.status}</span></div>
      <div className="profile-grid"><div><small>Started</small><strong>{new Date(encounter.startedAt).toLocaleString()}</strong></div><div><small>Visit date</small><strong>{visitDate}</strong></div><div><small>Doctor</small><strong>{encounter.doctorName}</strong></div><div><small>Hospital</small><strong>{encounter.hospitalName}</strong></div></div>
      {encounter.status === "ACTIVE" ? <>
        <div className="panel"><div className="section-toolbar"><div><span className="eyebrow">History</span><h2>History summary</h2><p>Use the summary as a quick reference. Check the original records before making clinical decisions.</p></div><button className="button button-primary" type="button" onClick={analyzeHistory} disabled={aiLoading}>{aiLoading ? "Loading…" : "Summarize history"}</button></div>{aiError && <div className="alert error">{aiError}</div>}{aiSummary && <div className="ai-summary" style={{ marginTop: 16, whiteSpace: "pre-wrap", lineHeight: 1.6 }}><strong>History summary</strong><p>{aiSummary.summary}</p><small>{aiSummary.recordsAnalyzed} record{aiSummary.recordsAnalyzed === 1 ? "" : "s"} reviewed · Verify against original records.</small></div>}</div>
        <MedicalRecords workerId={String(encounter.workerId)} encounterId={String(encounter.id)} />
        <div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Finish</span><h2>Complete visit</h2><p>Save all changes before completing.</p></div><button className="button button-primary" type="button" onClick={finish} disabled={completing}>{completing ? "Completing…" : "Complete visit"}</button></div></div>
      </> : <div className="empty-state-card"><h3>Visit completed</h3><p>This visit is closed and can no longer be edited.</p><button className="button button-secondary" type="button" onClick={() => navigate("/doctor/workers")}>Back to active visits</button></div>}
    </>}
  </RoleLayout>;
};
export default Encounter;
