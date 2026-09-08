import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyCurrentVisit, getMyWorkerProfile } from "../../services/workerService";
import { getApiError } from "../../services/api";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    try {
      setError("");
      if (refresh) setRefreshing(true); else setLoading(true);
      const [profileData, visitData] = await Promise.all([getMyWorkerProfile(), getMyCurrentVisit()]);
      setProfile(profileData);
      setCurrentVisit(visitData);
    } catch (err) {
      setError(getApiError(err, "Unable to load your dashboard."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <RoleLayout title="Dashboard"><div className="loading-card">Loading dashboard…</div></RoleLayout>;
  if (error && !profile) return <RoleLayout title="Dashboard"><div className="alert error" role="alert">{error}</div><button className="button button-primary" type="button" onClick={() => load()}>Try again</button></RoleLayout>;

  return (
    <RoleLayout
      title="Dashboard"
      description="Your worker details and current care status."
      actions={[
        { label: "My QR", onClick: () => navigate("/worker/qr") },
        { label: refreshing ? "Refreshing…" : "Refresh", onClick: () => load(true), variant: "secondary", disabled: refreshing },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}

      <section className="dashboard-welcome" aria-labelledby="worker-welcome-title">
        <div>
          <span className="eyebrow">Worker</span>
          <h2 id="worker-welcome-title">Welcome, {profile.fullName}.</h2>
          <div className="worker-welcome-meta">
            <span>{profile.active ? "Active" : "Inactive"}</span>
            {profile.workerCode && <span>Worker ID · {profile.workerCode}</span>}
          </div>
        </div>
        <div className="dashboard-mark" aria-hidden="true">W</div>
      </section>

      <div className="card-row worker-summary-grid">
        <article className="card worker-summary-card">
          <div className="worker-card-icon" aria-hidden="true">ID</div>
          <div><span className="eyebrow">Worker ID</span><h2>{profile.workerCode || "—"}</h2><p>Verified worker record</p></div>
        </article>
        <article className="card worker-summary-card">
          <div className="worker-card-icon" aria-hidden="true">+</div>
          <div><span className="eyebrow">Care team</span><h2>{profile.hospital?.name || "Not assigned"}</h2><p>{profile.assignedDoctor?.name ? `Dr. ${profile.assignedDoctor.name}` : "No doctor assigned"}</p></div>
        </article>
        <article className="card worker-summary-card">
          <div className={`worker-card-icon ${profile.active ? "is-active" : "is-inactive"}`} aria-hidden="true">●</div>
          <div><span className="eyebrow">Status</span><h2>{profile.active ? "Active" : "Inactive"}</h2><p>{profile.active ? "Worker record active" : "Contact registration officer"}</p></div>
        </article>
      </div>

      <section className="panel worker-care-panel" aria-labelledby="current-care-title">
        <div className="section-toolbar">
          <div><span className="eyebrow">Care</span><h2 id="current-care-title">{currentVisit ? "Current visit" : "No active visit"}</h2></div>
          <button className="button button-secondary worker-icon-button" type="button" onClick={() => load(true)} disabled={refreshing} aria-label="Refresh care status" title="Refresh care status">↻</button>
        </div>
        {currentVisit ? <div className="record-fields worker-current-visit">
          <div><small>Hospital</small><p>{currentVisit.hospitalName || "—"}</p></div>
          <div><small>Doctor</small><p>{currentVisit.doctorName || "—"}</p></div>
          <div><small>Specialization</small><p>{currentVisit.doctorSpecialization || "—"}</p></div>
          <div><small>Started</small><p>{formatDateTime(currentVisit.startedAt)}</p></div>
          <div><small>Status</small><p><span className="status-badge status-active">ACTIVE</span></p></div>
        </div> : <div className="worker-empty-inline"><span className="worker-empty-icon">✓</span><div><strong>No active visit</strong><p>Your current care details will appear here.</p></div></div>}
      </section>

      <section className="worker-section-heading">
        <div><span className="eyebrow">Records</span><h2>Quick access</h2></div>
      </section>

      <section className="worker-quick-grid" aria-label="Health records">
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/medical-history")}><span className="worker-quick-icon">▤</span><span><strong>Medical history</strong><small>Visits, diagnoses and treatment</small></span><span className="worker-quick-arrow">→</span></button>
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/prescriptions")}><span className="worker-quick-icon">Rx</span><span><strong>Prescriptions</strong><small>Medicines and instructions</small></span><span className="worker-quick-arrow">→</span></button>
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/documents")}><span className="worker-quick-icon">□</span><span><strong>Documents</strong><small>Medical files</small></span><span className="worker-quick-arrow">→</span></button>
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/profile")}><span className="worker-quick-icon">○</span><span><strong>Profile</strong><small>Personal and emergency details</small></span><span className="worker-quick-arrow">→</span></button>
      </section>
    </RoleLayout>
  );
};

export default WorkerDashboard;
