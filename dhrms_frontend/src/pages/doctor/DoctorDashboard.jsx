import { useCallback, useEffect, useMemo, useState } from "react";
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
      setDashboard(await getMyDoctorDashboard());
    } catch (err) {
      setError(getApiError(err, "Unable to load your clinical dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !dashboard) {
    return <RoleLayout title="Clinical dashboard"><div className="loading-card">Loading your clinical workspace…</div></RoleLayout>;
  }

  if (error && !dashboard) {
    return <RoleLayout title="Clinical dashboard"><div className="alert error" role="alert">{error}</div><button className="button button-primary" type="button" onClick={load}>Try again</button></RoleLayout>;
  }

  const { doctor, counts, activeVisits = [], recentVisits = [] } = dashboard;
  const activeCount = counts?.activeVisits ?? activeVisits.length;
  const completedToday = counts?.completedVisits ?? 0;
  const assignedWorkers = counts?.assignedWorkers ?? 0;
  const todayVisits = counts?.visitsToday ?? 0;
  const workloadLabel = activeCount === 0 ? "No active encounters" : `${activeCount} encounter${activeCount === 1 ? "" : "s"} requiring attention`;
  const doctorInitial = (doctor?.fullName || "D").charAt(0).toUpperCase();

  const metrics = useMemo(() => [
    { label: "Active encounters", value: activeCount, helper: activeCount ? "Currently in your clinical queue" : "Your queue is clear", icon: "01" },
    { label: "Today's visits", value: todayVisits, helper: "Records created today", icon: "02" },
    { label: "Completed today", value: completedToday, helper: "Encounters closed today", icon: "03" },
    { label: "Assigned workers", value: assignedWorkers, helper: "Workers currently assigned to you", icon: "04" },
  ], [activeCount, todayVisits, completedToday, assignedWorkers]);

  return (
    <RoleLayout
      title="Clinical dashboard"
      description={`${doctor?.specialization || "Doctor"}${doctor?.department ? ` · ${doctor.department}` : ""}`}
      actions={[
        { label: "Refresh", onClick: load, variant: "secondary", disabled: loading },
        { label: "Open active visits", onClick: () => navigate("/doctor/workers") },
      ]}
    >
      <div className="doctor-dashboard">
        {error && <div className="alert error" role="alert">{error}</div>}

        <section className="doctor-hero" aria-labelledby="doctor-welcome-title">
          <div className="doctor-hero-copy">
            <span className="doctor-kicker">Clinical workspace</span>
            <h2 id="doctor-welcome-title">Good to see you, Dr. {doctor?.fullName}.</h2>
            <p>Your dashboard keeps current encounters, today's workload, and recent clinical activity in one focused workspace. Start with the patients who need attention now.</p>
          </div>
          <div className="doctor-identity">
            <small>Signed in as</small>
            <strong>{doctor?.fullName}</strong>
            <span>{doctor?.specialization || "Doctor"}{doctor?.department ? ` · ${doctor.department}` : ""}</span>
          </div>
        </section>

        <section aria-labelledby="today-heading">
          <div className="doctor-section-head">
            <div><span className="eyebrow">Today at a glance</span><h2 id="today-heading">Your clinical workload</h2><p>Key activity indicators from your current DHRMS workspace.</p></div>
          </div>
          <div className="doctor-metrics" style={{ marginTop: 12 }}>
            {metrics.map((metric) => (
              <article className="doctor-metric" key={metric.label}>
                <div className="doctor-metric-top"><span className="doctor-metric-label">{metric.label}</span><span className="doctor-metric-icon">{metric.icon}</span></div>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="doctor-workload" aria-labelledby="active-heading">
          <div className="doctor-section-head">
            <div><span className="eyebrow">Priority queue</span><h2 id="active-heading">Active encounters</h2><p>{workloadLabel}. Open an encounter to review the worker record and continue clinical documentation.</p></div>
            <button className="button button-secondary" type="button" onClick={() => navigate("/doctor/workers")}>View all</button>
          </div>

          {activeVisits.length === 0 ? (
            <div className="doctor-empty"><strong>Your active queue is clear.</strong><p>New hospital encounters assigned to you will appear here. You can use Active Visits to review your current clinical workload at any time.</p></div>
          ) : (
            <div className="table-card">
              <table className="table">
                <thead><tr><th>Worker</th><th>Hospital</th><th>Started</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {activeVisits.map((visit) => (
                    <tr key={visit.id}>
                      <td><div className="person-cell"><span className="doctor-avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td>
                      <td>{visit.hospitalName || "—"}</td>
                      <td>{formatTime(visit.startedAt)}</td>
                      <td><span className="doctor-visit-status">Active</span></td>
                      <td><button className="button button-primary button-small" type="button" onClick={() => navigate(`/doctor/encounters/${visit.id}`)}>Open encounter</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="doctor-recent" aria-labelledby="recent-heading">
          <div className="doctor-section-head">
            <div><span className="eyebrow">Clinical activity</span><h2 id="recent-heading">Recent visits</h2><p>A concise record of your latest completed encounters.</p></div>
          </div>
          {recentVisits.length === 0 ? (
            <div className="doctor-empty"><strong>No completed visits yet.</strong><p>Once an encounter is completed, its clinical activity will appear here for quick reference.</p></div>
          ) : (
            <div className="table-card">
              <table className="table">
                <thead><tr><th>Worker</th><th>Date</th><th>Diagnosis</th><th /></tr></thead>
                <tbody>
                  {recentVisits.map((visit) => (
                    <tr key={visit.id}>
                      <td><div className="person-cell"><span className="doctor-avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td>
                      <td>{formatDate(visit.visitDate)}</td>
                      <td><span className="doctor-diagnosis">{visit.diagnosis || "No diagnosis recorded"}</span></td>
                      <td><button className="button button-ghost button-small" type="button" onClick={() => navigate(`/doctor/workers/${visit.workerId}`)}>View worker</button></td>
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
