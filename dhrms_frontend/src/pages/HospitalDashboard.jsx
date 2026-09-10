import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../components/RoleLayout";
import { getHospitalDashboard } from "../services/hospitalService";
import { getHospitalActiveEncounters } from "../services/encounterService";
import { getApiError } from "../services/api";

const MetricIcon = ({ children }) => <span className="stat-icon" aria-hidden="true">{children}</span>;

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [activeVisits, setActiveVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([getHospitalDashboard(), getHospitalActiveEncounters()])
      .then(([data, visits]) => {
        if (ignore) return;
        setDashboard(data);
        setActiveVisits(visits || []);
      })
      .catch((err) => {
        if (!ignore) setError(getApiError(err, "Unable to load hospital dashboard."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const recentVisits = useMemo(() => activeVisits.slice(0, 6), [activeVisits]);

  if (loading) return <RoleLayout title="Hospital overview" hideHeader hideBreadcrumbs><div className="loading-card">Loading hospital overview…</div></RoleLayout>;
  if (error) return <RoleLayout title="Hospital overview" hideHeader hideBreadcrumbs><div className="alert error" role="alert">{error}</div></RoleLayout>;

  const { hospital, counts } = dashboard;

  return (
    <RoleLayout
      title="Hospital overview"
      description={`${hospital.name}${hospital.code ? ` · ${hospital.code}` : ""}${hospital.city ? ` · ${hospital.city}` : ""}`}
      hideHeader
      hideBreadcrumbs
      actions={[
        { label: "Start visit", onClick: () => navigate("/hospital/workers/scan") },
        { label: "Find worker", onClick: () => navigate("/hospital/find-worker"), variant: "secondary" },
      ]}
    >
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">Today</span>
          <h2>Hospital overview</h2>
          <p>Review active care and manage workers and doctors from one place.</p>
        </div>
      </section>

      <section className="stats-grid" aria-label="Hospital activity summary">
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-label">Active visits</span><MetricIcon>↗</MetricIcon></div>
          <strong className="stat-value">{activeVisits.length}</strong>
          <span className="stat-helper">Currently receiving care</span>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-label">Available doctors</span><MetricIcon>+</MetricIcon></div>
          <strong className="stat-value">{counts.activeDoctors}</strong>
          <span className="stat-helper">Available for new visits</span>
        </article>
      </section>

      <section>
        <div className="section-toolbar" style={{ marginBottom: "12px" }}>
          <div>
            <span className="eyebrow">Quick actions</span>
            <h2>Common tasks</h2>
          </div>
        </div>
        <div className="workflow-grid">
          <article className="workflow-card">
            <div className="workflow-card-top"><span className="workflow-number">01</span></div>
            <h3>Start a visit</h3>
            <p>Identify a worker using their QR code and begin a clinical visit.</p>
            <button className="button button-primary button-small" type="button" onClick={() => navigate("/hospital/workers/scan")}>Start visit</button>
          </article>
          <article className="workflow-card">
            <div className="workflow-card-top"><span className="workflow-number">02</span></div>
            <h3>Find a worker</h3>
            <p>Search for a registered worker using their phone number.</p>
            <button className="button button-secondary button-small" type="button" onClick={() => navigate("/hospital/find-worker")}>Find worker</button>
          </article>
          <article className="workflow-card">
            <div className="workflow-card-top"><span className="workflow-number">03</span></div>
            <h3>Manage doctors</h3>
            <p>View hospital doctors and manage their availability and assignments.</p>
            <button className="button button-secondary button-small" type="button" onClick={() => navigate("/hospital/doctors")}>View doctors</button>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-toolbar">
          <div>
            <span className="eyebrow">Current activity</span>
            <h2>Active visits</h2>
            <p>Workers currently receiving care at this hospital.</p>
          </div>
          <button className="button button-secondary" type="button" onClick={() => navigate("/hospital/workers")}>View all</button>
        </div>
        {recentVisits.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">—</span>
            <h3>No active visits</h3>
            <p>There are no workers currently receiving care.</p>
            <button className="button button-primary" type="button" onClick={() => navigate("/hospital/workers/scan")}>Start a visit</button>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Doctor</th><th>Started</th><th>Status</th></tr></thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td><div className="person-cell"><span className="avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span><div><strong>{visit.workerName || "Worker"}</strong><small>{visit.workerCode || "Worker record"}</small></div></div></td>
                    <td><strong>{visit.doctorName || "Doctor"}</strong><small>{visit.doctorSpecialization || "Clinical team"}</small></td>
                    <td>{visit.startedAt ? new Date(visit.startedAt).toLocaleString() : "—"}</td>
                    <td><span className="status-badge status-active">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </RoleLayout>
  );
};

export default HospitalDashboard;
