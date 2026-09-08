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
      setVisits(await getHospitalActiveEncounters());
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
      description="Workers currently receiving care at your hospital. Completing a visit ends only the doctor assignment; the hospital relationship remains active."
      actions={[{ label: "Refresh", onClick: load, variant: "secondary" }]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="panel">
        <div className="section-toolbar">
          <div>
            <span className="eyebrow">Current encounters</span>
            <h2>{visits.length} active visit{visits.length === 1 ? "" : "s"}</h2>
            <p>These are the visits currently in progress. The worker remains associated with this hospital after the doctor completes the visit.</p>
          </div>
          <button className="button button-primary" type="button" onClick={() => navigate("/hospital/find-worker")}>Start visit</button>
        </div>

        {loading ? (
          <div className="loading-card">Loading active visits…</div>
        ) : visits.length === 0 ? (
          <div className="empty-state-card">
            <h3>No active visits</h3>
            <p>Find a worker by phone or scan their QR code to start a new visit.</p>
            <button className="button button-primary" type="button" onClick={() => navigate("/hospital/find-worker")}>Find worker</button>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Doctor</th><th>Started</th><th>Status</th></tr></thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar">{(visit.workerName || "W").charAt(0)}</span>
                        <div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div>
                      </div>
                    </td>
                    <td><strong>{visit.doctorName}</strong><small>{visit.doctorSpecialization || "Doctor"}</small></td>
                    <td>{new Date(visit.startedAt).toLocaleString()}</td>
                    <td><span className="status-badge status-active">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default ActiveVisits;
