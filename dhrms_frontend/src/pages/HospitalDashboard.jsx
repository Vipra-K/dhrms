import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../components/RoleLayout";
import { getHospitalDashboard } from "../services/hospitalService";
import { getHospitalActiveEncounters } from "../services/encounterService";
import { getApiError } from "../services/api";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [activeVisits, setActiveVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getHospitalDashboard(), getHospitalActiveEncounters()])
      .then(([data, visits]) => { setDashboard(data); setActiveVisits(visits || []); })
      .catch((err) => setError(getApiError(err, "Unable to load hospital dashboard.")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <RoleLayout title="Hospital dashboard"><div className="loading-card">Loading hospital overview…</div></RoleLayout>;
  if (error) return <RoleLayout title="Hospital dashboard"><div className="alert error">{error}</div></RoleLayout>;

  const { hospital, counts } = dashboard;
  return <RoleLayout title={hospital.name} description={`${hospital.code}${hospital.city ? ` · ${hospital.city}` : ""}`} actions={[
    { label: "Start worker visit", onClick: () => navigate("/hospital/workers/scan") },
    { label: "Manage doctors", onClick: () => navigate("/hospital/doctors"), variant: "secondary" },
  ]}>
    <div className="dashboard-welcome"><div><span className="eyebrow">Today at a glance</span><h2>Manage care, not permanent worker assignments.</h2><p>Scan a worker's permanent DHRMS QR, start a visit with the appropriate doctor, and let the encounter close when care is complete.</p></div><div className="dashboard-mark">H</div></div>
    <div className="card-row">
      <article className="card"><span className="eyebrow">Active visits</span><h2>{activeVisits.length}</h2><p>Workers currently receiving care at this hospital.</p><button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>Open visits</button></article>
      <article className="card"><span className="eyebrow">Active doctors</span><h2>{counts.activeDoctors}</h2><p>Doctors available to handle current visits.</p><button className="button button-secondary" onClick={() => navigate("/hospital/doctors")}>Open doctors</button></article>
      <article className="card"><span className="eyebrow">Worker identity</span><h2>QR</h2><p>Workers are registered outside the hospital and identified through their permanent DHRMS QR.</p><button className="button button-primary" onClick={() => navigate("/hospital/workers/scan")}>Scan worker</button></article>
    </div>
    <div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Current healthcare relationships</span><h2>Active visits</h2></div><button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>View all</button></div>{activeVisits.length === 0 ? <div className="empty-state-card"><h3>No active visits</h3><p>Scan a worker QR to begin the next consultation.</p></div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Doctor</th><th>Started</th><th>Status</th></tr></thead><tbody>{activeVisits.map((visit) => <tr key={visit.id}><td><div className="person-cell"><span className="avatar">{(visit.workerName || "W").charAt(0)}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td><td>{visit.doctorName}</td><td>{new Date(visit.startedAt).toLocaleString()}</td><td><span className="status-badge status-active">ACTIVE</span></td></tr>)}</tbody></table></div>}</div>
  </RoleLayout>;
};

export default HospitalDashboard;
