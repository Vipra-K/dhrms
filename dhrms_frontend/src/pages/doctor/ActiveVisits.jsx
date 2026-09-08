import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getDoctorActiveEncounters } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const ActiveVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try { setError(""); setVisits(await getDoctorActiveEncounters()); }
    catch (err) { setError(getApiError(err, "Unable to load active visits.")); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return <RoleLayout title="Active visits" description="Workers currently assigned to you for an ongoing consultation. These assignments end when the visit is completed." actions={[{ label: "Refresh", onClick: load, variant: "secondary" }]}>
    {error && <div className="alert error">{error}</div>}
    <div className="panel">
      <div className="section-toolbar"><div><span className="eyebrow">Current clinical workload</span><h2>{visits.length} active visit{visits.length === 1 ? "" : "s"}</h2><p>Open a visit to review history, add clinical information, upload reports, prescribe treatment and complete the consultation.</p></div></div>
      {loading ? <div className="loading-card">Loading active visits…</div> : visits.length === 0 ? <div className="empty-state-card"><h3>No active visits</h3><p>When a hospital starts a visit and selects you, it will appear here.</p></div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Hospital</th><th>Started</th><th /></tr></thead><tbody>{visits.map((visit) => <tr key={visit.id}><td><div className="person-cell"><span className="avatar">{(visit.workerName || "W").charAt(0)}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td><td>{visit.hospitalName}</td><td>{new Date(visit.startedAt).toLocaleString()}</td><td><button className="button button-primary button-small" onClick={() => navigate(`/doctor/encounters/${visit.id}`)}>Open visit</button></td></tr>)}</tbody></table></div>}
    </div>
  </RoleLayout>;
};
export default ActiveVisits;
