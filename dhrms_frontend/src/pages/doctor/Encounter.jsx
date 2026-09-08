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
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiError, setAiError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      setEncounter(await getDoctorEncounter(encounterId));
    } catch (err) {
      setError(getApiError(err, "Unable to load this visit."));
    } finally {
      setLoading(false);
    }
  }, [encounterId]);

  useEffect(() => {
    load();
  }, [load]);

  const visitDate = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date()),
    [],
  );

  const analyzeHistory = async () => {
    if (!encounter?.workerId) return;
    setAiLoading(true);
    setAiError("");
    try {
      const result = await getAiWorkerHistorySummary(encounter.workerId);
      setAiSummary(result);
    } catch (err) {
      setAiError(getApiError(err, "Unable to analyze the worker history."));
    } finally {
      setAiLoading(false);
    }
  };

  const finish = async () => {
    if (encounter?.status !== "ACTIVE") return;

    const confirmed = window.confirm(
      "Complete this visit? This closes only the current doctor-worker relationship. The worker will remain associated with the hospital until the hospital explicitly terminates that relationship. Make sure all clinical information has been saved before continuing.",
    );
    if (!confirmed) return;

    setCompleting(true);
    setError("");
    try {
      await completeEncounter(encounterId);
      navigate("/doctor/workers", { replace: true });
    } catch (err) {
      setError(getApiError(err, "Unable to complete the visit."));
    } finally {
      setCompleting(false);
    }
  };

  return (
    <RoleLayout
      title="Current clinical visit"
      description="Only the assigned doctor can work on this encounter. Completing it ends the doctor-worker relationship for this visit; the hospital relationship remains active."
      actions={[
        { label: "Refresh", onClick: load, variant: "secondary" },
        { label: "Back to active visits", onClick: () => navigate("/doctor/workers"), variant: "secondary" },
      ]}
    >
      {loading && !encounter && <div className="loading-card">Loading clinical visit…</div>}
      {error && <div className="alert error" role="alert">{error}</div>}

      {encounter && (
        <>
          <div className="card worker-profile-header">
            <div className="person-cell">
              <span className="avatar">{(encounter.workerName || "W").charAt(0)}</span>
              <div>
                <span className="eyebrow">Worker ID {encounter.workerCode}</span>
                <h2>{encounter.workerName}</h2>
                <p>{encounter.hospitalName} · {encounter.doctorName}</p>
              </div>
            </div>
            <span className={`status-badge ${encounter.status === "ACTIVE" ? "status-active" : "status-inactive"}`}>
              {encounter.status}
            </span>
          </div>

          <div className="profile-grid">
            <div><small>Visit started</small><strong>{new Date(encounter.startedAt).toLocaleString()}</strong></div>
            <div><small>Visit date</small><strong>{visitDate}</strong></div>
            <div><small>Doctor</small><strong>{encounter.doctorName}</strong></div>
            <div><small>Hospital</small><strong>{encounter.hospitalName}</strong></div>
          </div>

          {encounter.status === "ACTIVE" ? (
            <>
              <div className="panel">
                <div className="section-toolbar">
                  <div>
                    <span className="eyebrow">AI assistant</span>
                    <h2>Medical history summary</h2>
                    <p>Let Gemini review the worker's recent medical records and prescriptions and highlight information that may be useful during this visit.</p>
                  </div>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={analyzeHistory}
                    disabled={aiLoading}
                  >
                    {aiLoading ? "Analyzing…" : "🧠 Analyze history"}
                  </button>
                </div>
                {aiError && <div className="alert error" role="alert">{aiError}</div>}
                {aiSummary && (
                  <div className="ai-summary" style={{ marginTop: 16, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    <strong>AI Clinical History Summary</strong>
                    <p>{aiSummary.summary}</p>
                    <small>Based on {aiSummary.recordsAnalyzed} recent medical record{aiSummary.recordsAnalyzed === 1 ? "" : "s"}. Verify important information against the original records.</small>
                  </div>
                )}
              </div>

              <div className="alert info" role="status">
                <strong>Current visit.</strong> The medical record date is assigned automatically by the system. Create or edit the record below, then add prescriptions and attachments as needed.
              </div>
              <MedicalRecords
                workerId={String(encounter.workerId)}
                encounterId={String(encounter.id)}
              />
              <div className="panel">
                <div className="section-toolbar">
                  <div>
                    <span className="eyebrow">Finish care</span>
                    <h2>Complete this visit</h2>
                    <p>Save all clinical changes before completing. After completion, this doctor cannot continue editing this encounter.</p>
                  </div>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={finish}
                    disabled={completing}
                  >
                    {completing ? "Completing…" : "Complete visit"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state-card">
              <h3>This visit is complete</h3>
              <p>The doctor-worker relationship for this encounter is closed. The hospital-worker relationship remains active until the hospital terminates it.</p>
              <button className="button button-secondary" type="button" onClick={() => navigate("/doctor/workers")}>Back to active visits</button>
            </div>
          )}
        </>
      )}
    </RoleLayout>
  );
};

export default Encounter;
