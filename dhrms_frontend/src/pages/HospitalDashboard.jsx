import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../components/RoleLayout";
import { getHospitalDashboard } from "../services/hospitalService";
import { getApiError } from "../services/api";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHospitalDashboard()
      .then(setDashboard)
      .catch((err) => setError(getApiError(err, "Unable to load hospital dashboard.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <RoleLayout title="Hospital dashboard"><div className="loading-card">Loading hospital overview…</div></RoleLayout>;
  if (error) return <RoleLayout title="Hospital dashboard"><div className="alert error">{error}</div></RoleLayout>;

  const { hospital, counts, recentWorkers } = dashboard;

  return (
    <RoleLayout title={hospital.name} description={`${hospital.code}${hospital.city ? ` · ${hospital.city}` : ""}`} actions={[
      { label: "Register worker", onClick: () => navigate("/hospital/workers") },
      { label: "Manage doctors", onClick: () => navigate("/hospital/doctors"), variant: "secondary" },
    ]}>
      <div className="dashboard-welcome">
        <div><span className="eyebrow">Today at a glance</span><h2>Keep the worker lifecycle moving.</h2><p>Register workers, assign active doctors, and open the worker profile whenever you need the complete record.</p></div>
        <div className="dashboard-mark">H</div>
      </div>

      <div className="card-row">
        <article className="card"><span className="eyebrow">Workers</span><h2>{counts.workers}</h2><p>Total workers registered with this hospital.</p><button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>Open workers</button></article>
        <article className="card"><span className="eyebrow">Active doctors</span><h2>{counts.activeDoctors}</h2><p>Doctors currently available for assignment.</p><button className="button button-secondary" onClick={() => navigate("/hospital/doctors")}>Open doctors</button></article>
        <article className="card"><span className="eyebrow">Needs assignment</span><h2>{counts.unassignedWorkers}</h2><p>Active workers without a current doctor.</p><button className="button button-primary" onClick={() => navigate("/hospital/workers")}>Resolve now</button></article>
      </div>

      <div className="panel">
        <div className="section-toolbar"><div><span className="eyebrow">Worker lifecycle</span><h2>Recently registered</h2></div><button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>View all</button></div>
        {recentWorkers.length === 0 ? <div className="empty-state-card"><h3>No workers yet</h3><p>Register the first worker to start the hospital workflow.</p></div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Status</th><th>Current doctor</th><th /></tr></thead><tbody>{recentWorkers.map((worker) => <tr key={worker.id}><td><div className="person-cell"><span className="avatar">{worker.fullName.charAt(0)}</span><div><strong>{worker.fullName}</strong><small>{worker.workerCode}</small></div></div></td><td><span className={`status-badge ${worker.active ? "status-active" : "status-inactive"}`}>{worker.active ? "ACTIVE" : "INACTIVE"}</span></td><td>{worker.assignedDoctor?.name || <span className="muted-note">Unassigned</span>}</td><td><button className="button button-ghost button-small" onClick={() => navigate(`/hospital/workers/${worker.id}`)}>Open profile</button></td></tr>)}</tbody></table></div>}
      </div>
    </RoleLayout>
  );
};

export default HospitalDashboard;
