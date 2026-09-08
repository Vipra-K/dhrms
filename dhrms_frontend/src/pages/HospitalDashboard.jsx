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

  if (loading) return <RoleLayout title="Hospital overview"><div className="loading-card">Loading your hospital workspace…</div></RoleLayout>;
  if (error) return <RoleLayout title="Hospital overview"><div className="alert error" role="alert">{error}</div></RoleLayout>;

  const { hospital, counts } = dashboard;

  return (
    <RoleLayout
      title="Hospital overview"
      description={`${hospital.name}${hospital.code ? ` · ${hospital.code}` : ""}${hospital.city ? ` · ${hospital.city}` : ""}`}
      actions={[
        { label: "Start visit", onClick: () => navigate("/hospital/workers/scan") },
        { label: "Find worker", onClick: () => navigate("/hospital/find-worker"), variant: "secondary" },
      ]}
    >
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">Hospital operations</span>
          <h2>Keep every worker visit moving from identification to care.</h2>
          <p>Use the DHRMS QR or phone lookup to identify a worker, confirm their hospital relationship, and start the right clinical visit.</p>
        </div>
        <div className="dashboard-mark" aria-hidden="true">+</div>
      </section>

      <section className="stats-grid" aria-label="Hospital activity summary">
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-label">Active visits</span><MetricIcon>↗</MetricIcon></div>
          <strong className="stat-value">{activeVisits.length}</strong>
          <span className="stat-helper">Visits currently in progress</span>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-label">Active doctors</span><MetricIcon>+</MetricIcon></div>
          <strong className="stat-value">{counts.activeDoctors}</strong>
          <span className="stat-helper">Clinicians available for assignments</span>
        </article>
      </section>

      <section>
        <div className="section-toolbar" style={{ marginBottom: "12px" }}>
          <div><span className="eyebrow">Care flow</span><h2>Choose the right entry point</h2><p>Each path uses the same hospital and clinical relationships already configured in DHRMS.</p></div>
        </div>
        <div className="workflow-grid">
          <article className="workflow-card">
            <div className="workflow-card-top"><span className="workflow-number">01</span><span className="workflow-arrow">→</span></div>
            <h3>Identify a worker</h3>
            <p>Scan their QR card at reception or look them up by registered phone number.</p>
            <div className="row-actions"><button className="button button-secondary button-small" type="button" onClick={() => navigate("/hospital/workers/scan")}>Scan QR</button><button className="button button-ghost button-small" type="button" onClick={() => navigate("/hospital/find-worker")}>Find by phone</button></div>
          </article>
          <article className="workflow-card">
            <div className="workflow-card-top"><span className="workflow-number">02</span><span className="workflow-arrow">→</span></div>
            <h3>Assign a doctor</h3>
            <p>Change the worker's current doctor assignment without starting a visit.</p>
            <button className="button button-secondary button-small" type="button" onClick={() => navigate("/hospital/assign-doctor")}>Assign doctor</button>
          </article>
          <article className="workflow-card">
            <div className="workflow-card-top"><span className="workflow-number">03</span><span className="workflow-arrow">→</span></div>
            <h3>Monitor active care</h3>
            <p>Review active encounters and the clinician responsible for each visit.</p>
            <button className="button button-secondary button-small" type="button" onClick={() => navigate("/hospital/workers")}>View active visits</button>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-toolbar">
          <div><span className="eyebrow">Live queue</span><h2>Active visits</h2><p>Workers currently receiving care at this hospital.</p></div>
          <button className="button button-secondary" type="button" onClick={() => navigate("/hospital/workers")}>View all</button>
        </div>
        {recentVisits.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">+</span>
            <h3>No active visits</h3>
            <p>When a visit starts, the worker and assigned doctor will appear here.</p>
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
