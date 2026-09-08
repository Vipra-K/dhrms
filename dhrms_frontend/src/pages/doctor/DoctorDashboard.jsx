import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyDoctorDashboard } from "../../services/doctorService";
import { getApiError } from "../../services/api";

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
      setError(getApiError(err, "Unable to load doctor dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && !dashboard) return <RoleLayout title="Doctor dashboard"><div className="loading-card">Loading your clinical workspace…</div></RoleLayout>;
  if (error && !dashboard) return <RoleLayout title="Doctor dashboard"><div className="alert error" role="alert">{error}</div><button className="button button-primary" type="button" onClick={load}>Try again</button></RoleLayout>;

  const { doctor, counts, activeVisits = [], recentVisits = [] } = dashboard;

  return (
    <RoleLayout
      title={`Welcome, ${doctor.fullName}`}
      description={`${doctor.specialization || "Doctor"}${doctor.department ? ` · ${doctor.department}` : ""}`}
      actions={[
        { label: "Refresh", onClick: load, variant: "secondary" },
        { label: "View active visits", onClick: () => navigate("/doctor/workers") },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}

      <div className="dashboard-welcome">
        <div><span className="eyebrow">Clinical workspace</span><h2>Focus on the visits that need you now.</h2><p>Active encounters stay at the top. Completed visits and today's activity remain available for review.</p></div>
        <div className="dashboard-mark">D</div>
      </div>

      <div className="card-row">
        <article className="card">
          <span className="eyebrow">Active visits</span>
          <h2>{counts.activeVisits ?? activeVisits.length}</h2>
          <p>Workers currently waiting for or receiving your care.</p>
          <button className="button button-primary" type="button" onClick={() => navigate("/doctor/workers")}>Open active visits</button>
        </article>
        <article className="card">
          <span className="eyebrow">Visits today</span>
          <h2>{counts.visitsToday}</h2>
          <p>Medical records recorded for today.</p>
        </article>
        <article className="card">
          <span className="eyebrow">Completed today</span>
          <h2>{counts.completedVisits ?? 0}</h2>
          <p>Visits completed by you since today's start.</p>
        </article>
        <article className="card">
          <span className="eyebrow">Assigned workers</span>
          <h2>{counts.assignedWorkers}</h2>
          <p>Workers with an active assignment to you.</p>
        </article>
      </div>

      <div className="panel">
        <div className="section-toolbar">
          <div><span className="eyebrow">Current workload</span><h2>Active visits</h2><p>Open a visit to review the worker's history and continue the clinical encounter.</p></div>
          <button className="button button-secondary" type="button" onClick={() => navigate("/doctor/workers")}>View all</button>
        </div>
        {activeVisits.length === 0 ? (
          <div className="empty-state-card"><h3>No active visits</h3><p>When a hospital starts a visit and selects you, it will appear here.</p></div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Hospital</th><th>Started</th><th /></tr></thead>
              <tbody>
                {activeVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td><div className="person-cell"><span className="avatar">{(visit.workerName || "W").charAt(0)}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td>
                    <td>{visit.hospitalName}</td>
                    <td>{new Date(visit.startedAt).toLocaleString()}</td>
                    <td><button className="button button-primary button-small" type="button" onClick={() => navigate(`/doctor/encounters/${visit.id}`)}>Open encounter</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="section-toolbar">
          <div><span className="eyebrow">Recent activity</span><h2>Recent visits</h2><p>Your most recent completed clinical records.</p></div>
        </div>
        {recentVisits.length === 0 ? (
          <div className="empty-state-card"><h3>No completed visits yet</h3><p>Completed encounters will appear here after you finish a visit.</p></div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Date</th><th>Diagnosis</th><th /></tr></thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td><div className="person-cell"><span className="avatar">{(visit.workerName || "W").charAt(0)}</span><div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div></div></td>
                    <td>{new Date(visit.visitDate).toLocaleDateString()}</td>
                    <td>{visit.diagnosis || "—"}</td>
                    <td><button className="button button-ghost button-small" type="button" onClick={() => navigate(`/doctor/workers/${visit.workerId}`)}>Open worker</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default DoctorDashboard;
