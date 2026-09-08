import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyDoctorDashboard } from "../../services/doctorService";
import { getApiError } from "../../services/api";

const formatTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getMyDoctorDashboard();
      setDashboard(data || {});
    } catch (err) {
      setError(getApiError(err, "Unable to load the dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !dashboard) {
    return (
      <RoleLayout title="Dashboard">
        <div className="loading-card">Loading dashboard…</div>
      </RoleLayout>
    );
  }

  if (error && !dashboard) {
    return (
      <RoleLayout title="Dashboard">
        <div className="alert error" role="alert">{error}</div>
        <button className="button button-primary" type="button" onClick={load}>Try again</button>
      </RoleLayout>
    );
  }

  const doctor = dashboard?.doctor || {};
  const counts = dashboard?.counts || {};
  const activeVisits = Array.isArray(dashboard?.activeVisits) ? dashboard.activeVisits : [];
  const recentVisits = Array.isArray(dashboard?.recentVisits) ? dashboard.recentVisits : [];
  const activeCount = counts.activeVisits ?? activeVisits.length;
  const completedToday = counts.completedVisits ?? 0;
  const assignedWorkers = counts.assignedWorkers ?? 0;
  const todayVisits = counts.visitsToday ?? 0;

  const metrics = [
    { label: "Active visits", value: activeCount, helper: "Needs attention" },
    { label: "Today's visits", value: todayVisits, helper: "Today" },
    { label: "Completed", value: completedToday, helper: "Today" },
    { label: "My workers", value: assignedWorkers, helper: "Assigned" },
  ];

  return (
    <RoleLayout
      title="Dashboard"
      description={`${doctor.specialization || "Doctor"}${doctor.department ? ` · ${doctor.department}` : ""}`}
      actions={[
        { label: "Refresh", onClick: load, variant: "secondary", disabled: loading },
        { label: "Active visits", onClick: () => navigate("/doctor/workers") },
      ]}
    >
      <div className="doctor-dashboard">
        {error && <div className="alert error" role="alert">{error}</div>}

        <section className="doctor-hero" aria-labelledby="doctor-welcome-title">
          <div className="doctor-hero-copy">
            <span className="doctor-kicker">Doctor workspace</span>
            <h2 id="doctor-welcome-title">Good morning, Dr. {doctor.fullName || "Doctor"}.</h2>
            <p>Review active visits and recent activity from one place.</p>
          </div>
          <div className="doctor-identity">
            <small>Doctor</small>
            <strong>{doctor.fullName || "Doctor"}</strong>
            <span>{doctor.specialization || "—"}{doctor.department ? ` · ${doctor.department}` : ""}</span>
          </div>
        </section>

        <section aria-labelledby="today-heading">
          <div className="doctor-section-head">
            <div><span className="eyebrow">Overview</span><h2 id="today-heading">Today</h2></div>
          </div>
          <div className="doctor-metrics" style={{ marginTop: 12 }}>
            {metrics.map((metric) => (
              <article className="doctor-metric" key={metric.label}>
                <div className="doctor-metric-top">
                  <span className="doctor-metric-label">{metric.label}</span>
                  <span className="doctor-metric-icon">•</span>
                </div>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="doctor-workload" aria-labelledby="active-heading">
          <div className="doctor-section-head">
            <div>
              <span className="eyebrow">Current</span>
              <h2 id="active-heading">Active visits</h2>
              <p>{activeCount ? `${activeCount} active visit${activeCount === 1 ? "" : "s"}.` : "No active visits."}</p>
            </div>
            <button className="button button-secondary" type="button" onClick={() => navigate("/doctor/workers")}>View all</button>
          </div>

          {activeVisits.length === 0 ? (
            <div className="doctor-empty">
              <strong>No active visits</strong>
              <p>New visits will appear here when assigned.</p>
            </div>
          ) : (
            <div className="table-card">
              <table className="table">
                <thead><tr><th>Worker</th><th>Hospital</th><th>Started</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {activeVisits.map((visit) => (
                    <tr key={visit.id}>
                      <td><div className="person-cell"><span className="doctor-avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span><div><strong>{visit.workerName || "Unknown worker"}</strong><small>{visit.workerCode || "—"}</small></div></div></td>
                      <td>{visit.hospitalName || "—"}</td>
                      <td>{formatTime(visit.startedAt)}</td>
                      <td><span className="doctor-visit-status">Active</span></td>
                      <td><button className="button button-primary button-small" type="button" onClick={() => navigate(`/doctor/encounters/${visit.id}`)}>Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="doctor-recent" aria-labelledby="recent-heading">
          <div className="doctor-section-head">
            <div>
              <span className="eyebrow">History</span>
              <h2 id="recent-heading">Recent visits</h2>
            </div>
          </div>
          {recentVisits.length === 0 ? (
            <div className="doctor-empty">
              <strong>No recent visits</strong>
              <p>Completed visits will appear here.</p>
            </div>
          ) : (
            <div className="table-card">
              <table className="table">
                <thead><tr><th>Worker</th><th>Date</th><th>Diagnosis</th><th /></tr></thead>
                <tbody>
                  {recentVisits.map((visit) => (
                    <tr key={visit.id}>
                      <td><div className="person-cell"><span className="doctor-avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span><div><strong>{visit.workerName || "Unknown worker"}</strong><small>{visit.workerCode || "—"}</small></div></div></td>
                      <td>{formatDate(visit.visitDate)}</td>
                      <td><span className="doctor-diagnosis">{visit.diagnosis || "—"}</span></td>
                      <td><button className="button button-ghost button-small" type="button" onClick={() => navigate(`/doctor/workers/${visit.workerId}`)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </RoleLayout>
  );
};

export default DoctorDashboard;
