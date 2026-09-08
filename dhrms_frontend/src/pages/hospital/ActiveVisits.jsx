import { useCallback, useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getHospitalActiveEncounters } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const ActiveVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setError(""); setVisits(await getHospitalActiveEncounters()); }
    catch (err) { setError(getApiError(err, "Unable to load active visits.")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <RoleLayout title="Active visits" description="Workers currently receiving care at your hospital. A visit closes when the assigned doctor completes it." actions={[{ label: "Refresh", onClick: load, variant: "secondary" }]}>
    {error && <div className="alert error">{error}</div>}
    <div className="panel">
      <div className="section-toolbar"><div><span className="eyebrow">Temporary healthcare relationships</span><h2>{visits.length} active visit{visits.length === 1 ? "" : "s"}</h2><p>These workers are connected to this hospital only for the current encounter.</p></div></div>
      {loading ? <div className="loading-card">Loading active visits…</div> : visits.length === 0 ? <div className="empty-state-card"><h3>No active visits</h3><p>Scan a worker's DHRMS QR to start a new visit.</p></div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Doctor</th><th>Started</th><th>Status</th></tr></thead><tbody>{visits.map((visit) => <tr key={visit.id}><td><div className="person-cell"><span className="avatar">{(visit.workerName || "W").charAt(0)}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td><td><strong>{visit.doctorName}</strong><small>{visit.doctorSpecialization || "Doctor"}</small></td><td>{new Date(visit.startedAt).toLocaleString()}</td><td><span className="status-badge status-active">ACTIVE</span></td></tr>)}</tbody></table></div>}
    </div>
  </RoleLayout>;
};

export default ActiveVisits;
