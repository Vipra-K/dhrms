import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyDoctorDashboard } from "../../services/doctorService";
import { getApiError } from "../../services/api";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyDoctorDashboard().then(setDashboard).catch((err) => setError(getApiError(err, "Unable to load doctor dashboard."))).finally(() => setLoading(false));
  }, []);

  if (loading) return <RoleLayout title="Doctor dashboard"><div className="loading-card">Loading your clinical workspace…</div></RoleLayout>;
  if (error) return <RoleLayout title="Doctor dashboard"><div className="alert error">{error}</div></RoleLayout>;

  const { doctor, counts, recentVisits } = dashboard;

  return <RoleLayout title={`Welcome, ${doctor.fullName}`} description={`${doctor.specialization || "Doctor"}${doctor.department ? ` · ${doctor.department}` : ""}`} actions={[{ label: "View assigned workers", onClick: () => navigate("/doctor/workers") }]}>
    <div className="dashboard-welcome"><div><span className="eyebrow">Clinical workspace</span><h2>Start with the workers under your care.</h2><p>Your dashboard surfaces the people and recent visits that matter first.</p></div><div className="dashboard-mark">D</div></div>
    <div className="card-row"><article className="card"><span className="eyebrow">Assigned workers</span><h2>{counts.assignedWorkers}</h2><p>Workers with an active assignment to you.</p><button className="button button-primary" onClick={() => navigate("/doctor/workers")}>Open workers</button></article><article className="card"><span className="eyebrow">Visits today</span><h2>{counts.visitsToday}</h2><p>Medical records recorded for today.</p></article><article className="card"><span className="eyebrow">Role</span><h2>{doctor.role.replaceAll("_", " ")}</h2><p>License: {doctor.licenseNumber || "Not specified"}</p></article></div>
    <div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Recent activity</span><h2>Recent visits</h2></div><button className="button button-secondary" onClick={() => navigate("/doctor/workers")}>View all workers</button></div>{recentVisits.length === 0 ? <div className="empty-state-card"><h3>No visits recorded yet</h3><p>Open an assigned worker to create the first clinical visit.</p></div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Date</th><th>Diagnosis</th><th /></tr></thead><tbody>{recentVisits.map((visit) => <tr key={visit.id}><td><div className="person-cell"><span className="avatar">{visit.workerName.charAt(0)}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td><td>{new Date(visit.visitDate).toLocaleDateString()}</td><td>{visit.diagnosis}</td><td><button className="button button-ghost button-small" onClick={() => navigate(`/doctor/workers/${visit.workerId}`)}>Open worker</button></td></tr>)}</tbody></table></div>}</div>
  </RoleLayout>;
};

export default DoctorDashboard;
