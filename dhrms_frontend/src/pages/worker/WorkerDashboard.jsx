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

const Icon = ({ children }) => <span className="worker-action-icon" aria-hidden="true">{children}</span>;

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
      setError(getApiError(err, "We couldn't load your worker portal."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <RoleLayout title="Overview"><div className="loading-card">Preparing your secure health workspace…</div></RoleLayout>;
  }

  if (error && !profile) {
    return <RoleLayout title="Overview"><div className="alert error" role="alert">{error}</div><button className="button button-primary" type="button" onClick={() => load()}>Try again</button></RoleLayout>;
  }

  return (
    <RoleLayout
      title="Your health overview"
      description="A secure, read-only view of your verified worker identity and authorized clinical records."
      actions={[
        { label: "My QR", icon: "⌁", onClick: () => navigate("/worker/qr") },
        { label: refreshing ? "Refreshing" : "Refresh", icon: "↻", onClick: () => load(true), variant: "secondary", disabled: refreshing },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}

      <section className="dashboard-welcome" aria-labelledby="worker-welcome-title">
        <div>
          <span className="eyebrow">Personal health workspace</span>
          <h2 id="worker-welcome-title">Welcome back, {profile.fullName}.</h2>
          <p>Your DHRMS identity connects you with authorized healthcare services. Review your care relationship, active visit and clinical history from one secure workspace.</p>
          <div className="worker-welcome-meta">
            <span><i aria-hidden="true" /> {profile.active ? "Worker identity active" : "Worker identity inactive"}</span>
            {profile.workerCode && <span>Worker ID · {profile.workerCode}</span>}
          </div>
        </div>
        <div className="dashboard-mark" title="Worker account" aria-label="Worker account">W</div>
      </section>

      <div className="card-row worker-summary-grid">
        <article className="card worker-summary-card">
          <div className="worker-card-icon" aria-hidden="true">ID</div>
          <div><span className="eyebrow">Worker identity</span><h2>{profile.workerCode || "—"}</h2><p>Your verified DHRMS worker identifier.</p></div>
        </article>
        <article className="card worker-summary-card">
          <div className="worker-card-icon" aria-hidden="true">+</div>
          <div><span className="eyebrow">Care team</span><h2>{profile.hospital?.name || "Not assigned"}</h2><p>{profile.assignedDoctor?.name ? `Dr. ${profile.assignedDoctor.name}` : "No doctor is currently assigned"}</p></div>
        </article>
        <article className="card worker-summary-card">
          <div className={`worker-card-icon ${profile.active ? "is-active" : "is-inactive"}`} aria-hidden="true">●</div>
          <div><span className="eyebrow">Account status</span><h2>{profile.active ? "Active" : "Inactive"}</h2><p>{profile.active ? "Your worker identity is active in DHRMS." : "Contact your registration officer for assistance."}</p></div>
        </article>
      </div>

      <section className="panel worker-care-panel" aria-labelledby="current-care-title">
        <div className="section-toolbar">
          <div>
            <span className="eyebrow">Care status</span>
            <h2 id="current-care-title">{currentVisit ? "Current clinical visit" : "No active clinical visit"}</h2>
            <p>{currentVisit ? "An authorized hospital has an active encounter linked to your worker record." : "When a hospital starts a visit for you, its details will appear here."}</p>
          </div>
          <button className="button button-secondary worker-icon-button" type="button" onClick={() => load(true)} disabled={refreshing} aria-label="Refresh care status" title="Refresh care status">
            <Icon>↻</Icon>
          </button>
        </div>
        {currentVisit ? (
          <div className="record-fields worker-current-visit">
            <div><small>Hospital</small><p>{currentVisit.hospitalName || "—"}</p></div>
            <div><small>Doctor</small><p>{currentVisit.doctorName || "—"}</p></div>
            <div><small>Specialization</small><p>{currentVisit.doctorSpecialization || "—"}</p></div>
            <div><small>Visit started</small><p>{formatDateTime(currentVisit.startedAt)}</p></div>
            <div><small>Status</small><p><span className="status-badge status-active">ACTIVE</span></p></div>
          </div>
        ) : (
          <div className="worker-empty-inline"><span className="worker-empty-icon">✓</span><div><strong>No active encounter</strong><p>There is currently no clinical visit associated with your worker record.</p></div></div>
        )}
      </section>

      <section className="worker-section-heading">
        <div><span className="eyebrow">Health records</span><h2>Quick access</h2><p>Open the information you need without searching through your records.</p></div>
      </section>

      <section className="worker-quick-grid" aria-label="Health record shortcuts">
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/medical-history")}>
          <span className="worker-quick-icon">▤</span><span><strong>Medical history</strong><small>Review visits, diagnoses, treatments and clinical notes.</small></span><span className="worker-quick-arrow">→</span>
        </button>
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/prescriptions")}>
          <span className="worker-quick-icon">Rx</span><span><strong>Prescriptions</strong><small>Review medicines, dosage and instructions from recorded visits.</small></span><span className="worker-quick-arrow">→</span>
        </button>
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/documents")}>
          <span className="worker-quick-icon">□</span><span><strong>Medical documents</strong><small>View documents attached to your authorized clinical records.</small></span><span className="worker-quick-arrow">→</span>
        </button>
        <button className="worker-quick-card" type="button" onClick={() => navigate("/worker/profile")}>
          <span className="worker-quick-icon">○</span><span><strong>Personal profile</strong><small>Review your contact and emergency information.</small></span><span className="worker-quick-arrow">→</span>
        </button>
      </section>

      <div className="dashboard-note worker-privacy-note">
        <strong>Protected health information</strong>
        <span>Your worker portal is read-only for clinical records. Authorized healthcare staff manage medical information according to their role.</span>
      </div>
    </RoleLayout>
  );
};

export default WorkerDashboard;
