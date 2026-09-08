import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getHospitalActiveEncounters } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const ActiveVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      setVisits((await getHospitalActiveEncounters()) || []);
    } catch (err) {
      setError(getApiError(err, "Unable to load active visits."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <RoleLayout
      title="Active visits"
      description="A live view of workers currently receiving care at this hospital."
      actions={[
        { label: "Start visit", onClick: () => navigate("/hospital/workers/scan") },
        { label: "Refresh", onClick: load, variant: "secondary", disabled: loading },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      <section className="panel">
        <div className="section-toolbar" style={{ marginBottom: "18px" }}>
          <div><span className="eyebrow">Live queue</span><h2>{visits.length} active visit{visits.length === 1 ? "" : "s"}</h2><p>Each row shows the worker, responsible doctor, start time, and current status.</p></div>
        </div>

        {loading ? (
          <div className="loading-card">Loading the live visit queue…</div>
        ) : visits.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">+</span>
            <h3>No active visits</h3>
            <p>Start from a worker's QR code or use phone lookup to create the next encounter.</p>
            <div className="row-actions" style={{ justifyContent: "center" }}><button className="button button-primary" type="button" onClick={() => navigate("/hospital/workers/scan")}>Scan worker QR</button><button className="button button-secondary" type="button" onClick={() => navigate("/hospital/find-worker")}>Find by phone</button></div>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Doctor</th><th>Started</th><th>Status</th></tr></thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td><div className="person-cell"><span className="avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span><div><strong>{visit.workerName || "Worker"}</strong><small>{visit.workerCode || "Worker record"}</small></div></div></td>
                    <td><div><strong>{visit.doctorName || "Doctor"}</strong><small>{visit.doctorSpecialization || "Clinical team"}</small></div></td>
                    <td>{visit.startedAt ? new Date(visit.startedAt).toLocaleString() : "—"}</td>
                    <td><span className="status-badge status-active">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="dashboard-note"><strong>Relationship stays active.</strong><span>Completing a clinical visit ends the doctor assignment for that encounter; it does not remove the worker from this hospital. Use Workers to manage the hospital relationship.</span></div>
    </RoleLayout>
  );
};

export default ActiveVisits;
