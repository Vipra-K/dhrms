import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../components/RoleLayout";
import { getHospitalDashboard } from "../services/hospitalService";
import { getHospitalActiveEncounters } from "../services/encounterService";
import { getApiError } from "../services/api";
import "./hospital-dashboard.css";

const Icon = ({ name }) => {
  const paths = {
    activity: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M17 3.2a4 4 0 0 1 0 7.6M21 21v-2a4 4 0 0 0-2.5-3.7" /></>,
    doctor: <><circle cx="12" cy="7" r="4" /><path d="M5 21a7 7 0 0 1 14 0M19 5v4m-2-2h4" /></>,
    scan: <><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" /><path d="M8 12h8M12 8v8" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    alert: <><path d="M10.3 3.7 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>
  };
  return <svg className="hospital-dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

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

  if (loading) {
    return <RoleLayout title="Hospital overview" hideHeader><div className="hospital-dashboard-state">Loading dashboard</div></RoleLayout>;
  }

  if (error) {
    return <RoleLayout title="Hospital overview" hideHeader><div className="alert error" role="alert">{error}</div></RoleLayout>;
  }

  const { hospital, counts } = dashboard;
  const workers = counts.workers ?? 0;
  const unassigned = counts.unassignedWorkers ?? 0;
  const doctors = counts.activeDoctors ?? 0;

  return (
    <RoleLayout title="Hospital overview" hideHeader>
      <div className="hospital-dashboard">
        <header className="hospital-dashboard-header">
          <div>
            <span className="hospital-dashboard-kicker">Hospital dashboard</span>
            <h1>{hospital.name}</h1>
            <p>{[hospital.code, hospital.city].filter(Boolean).join(" · ")}</p>
          </div>
          <button className="button button-primary hospital-primary-action" type="button" onClick={() => navigate("/hospital/workers/scan")}>
            <Icon name="scan" /> Start visit
          </button>
        </header>

        <section className="hospital-metrics" aria-label="Hospital activity summary">
          <article className="hospital-metric">
            <span className="hospital-metric-icon"><Icon name="activity" /></span>
            <div><span>Active visits</span><strong>{activeVisits.length}</strong><small>Currently in care</small></div>
          </article>
          <article className="hospital-metric">
            <span className="hospital-metric-icon"><Icon name="doctor" /></span>
            <div><span>Available doctors</span><strong>{doctors}</strong><small>Ready for visits</small></div>
          </article>
          <article className="hospital-metric">
            <span className="hospital-metric-icon"><Icon name="users" /></span>
            <div><span>Workers</span><strong>{workers}</strong><small>Connected to hospital</small></div>
          </article>
          <article className={`hospital-metric ${unassigned > 0 ? "attention" : ""}`}>
            <span className="hospital-metric-icon"><Icon name="alert" /></span>
            <div><span>Unassigned</span><strong>{unassigned}</strong><small>{unassigned > 0 ? "Need attention" : "All clear"}</small></div>
          </article>
        </section>

        <section className="hospital-section">
          <div className="hospital-section-heading">
            <div><h2>Active visits</h2><span>{activeVisits.length} currently in care</span></div>
            <button className="button button-secondary" type="button" onClick={() => navigate("/hospital/workers")}>View all <Icon name="arrow" /></button>
          </div>

          {recentVisits.length === 0 ? (
            <div className="hospital-empty">
              <span className="hospital-empty-icon"><Icon name="activity" /></span>
              <h3>No active visits</h3>
              <p>There are currently no workers receiving care.</p>
              <button className="button button-primary" type="button" onClick={() => navigate("/hospital/workers/scan")}>Start visit</button>
            </div>
          ) : (
            <div className="hospital-visits">
              <div className="hospital-visits-head"><span>Worker</span><span>Doctor</span><span>Started</span><span>Status</span></div>
              {recentVisits.map((visit) => (
                <div className="hospital-visit-row" key={visit.id}>
                  <div className="hospital-worker">
                    <span className="hospital-worker-avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span>
                    <div><strong>{visit.workerName || "Worker"}</strong><small>{visit.workerCode || "Worker record"}</small></div>
                  </div>
                  <div className="hospital-doctor"><strong>{visit.doctorName || "Doctor"}</strong><small>{visit.doctorSpecialization || "Clinical team"}</small></div>
                  <span className="hospital-started">{visit.startedAt ? new Date(visit.startedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—"}</span>
                  <span className="status-badge status-active">ACTIVE</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {unassigned > 0 && (
          <section className="hospital-attention">
            <div><span className="hospital-attention-icon"><Icon name="alert" /></span><div><strong>{unassigned} worker{unassigned === 1 ? "" : "s"} need attention</strong><p>Review workers without a current doctor assignment.</p></div></div>
            <button className="button button-secondary" type="button" onClick={() => navigate("/hospital/manage-workers")}>Review <Icon name="arrow" /></button>
          </section>
        )}

        <section className="hospital-actions">
          <button type="button" onClick={() => navigate("/hospital/workers/scan")}><span><Icon name="scan" /></span><div><strong>Start visit</strong></div><Icon name="arrow" /></button>
          <button type="button" onClick={() => navigate("/hospital/find-worker")}><span><Icon name="search" /></span><div><strong>Find worker</strong></div><Icon name="arrow" /></button>
          <button type="button" onClick={() => navigate("/hospital/doctors")}><span><Icon name="doctor" /></span><div><strong>Doctors</strong></div><Icon name="arrow" /></button>
        </section>
      </div>
    </RoleLayout>
  );
};

export default HospitalDashboard;
