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

  if (loading) return <RoleLayout title="My health"><div className="loading-card">Loading your health workspace…</div></RoleLayout>;
  if (error && !profile) return <RoleLayout title="My health"><div className="alert error" role="alert">{error}</div><button className="button button-primary" type="button" onClick={() => load()}>Try again</button></RoleLayout>;

  return (
    <RoleLayout title={`Welcome, ${profile.fullName}`} description={`Worker ID ${profile.workerCode}`} actions={[
      { label: "My QR", onClick: () => navigate("/worker/qr") },
      { label: "Medical history", onClick: () => navigate("/worker/medical-history"), variant: "secondary" },
    ]}>
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="dashboard-welcome">
        <div><span className="eyebrow">Personal health workspace</span><h2>Your care information, in one place.</h2><p>Use your QR for identification, see your current visit, and review your complete clinical history across hospitals.</p></div>
        <div className="dashboard-mark">W</div>
      </div>

      <div className="card-row">
        <article className="card"><span className="eyebrow">Current hospital</span><h2>{profile.hospital?.name || "Not assigned"}</h2><p>{profile.hospital?.code || "No hospital relationship yet"}{profile.hospital?.city ? ` · ${profile.hospital.city}` : ""}</p></article>
        <article className="card"><span className="eyebrow">Assigned doctor</span><h2>{profile.assignedDoctor?.name || "Not assigned"}</h2><p>{profile.assignedDoctor?.specialization || "No doctor is currently assigned."}</p></article>
        <article className="card"><span className="eyebrow">Worker status</span><h2>{profile.active ? "ACTIVE" : "INACTIVE"}</h2><p>Your DHRMS identity remains tied to your worker profile.</p></article>
      </div>

      <div className="panel">
        <div className="section-toolbar">
          <div><span className="eyebrow">Current visit</span><h2>{currentVisit ? "You are currently being seen" : "No active visit"}</h2></div>
          <button className="button button-secondary" type="button" onClick={() => load(true)} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button>
        </div>
        {currentVisit ? (
          <div className="record-fields">
            <div><small>Hospital</small><p>{currentVisit.hospitalName}</p></div>
            <div><small>Doctor</small><p>{currentVisit.doctorName}</p></div>
            <div><small>Specialization</small><p>{currentVisit.doctorSpecialization || "—"}</p></div>
            <div><small>Visit started</small><p>{formatDateTime(currentVisit.startedAt)}</p></div>
            <div><small>Status</small><p><span className="status-badge status-active">ACTIVE</span></p></div>
          </div>
        ) : (
          <p>Your next visit will appear here when a hospital starts an encounter for you.</p>
        )}
      </div>

      <div className="panel">
        <div className="section-toolbar"><div><span className="eyebrow">Your records</span><h2>Access your health information</h2></div><button className="button button-primary" type="button" onClick={() => navigate("/worker/medical-history")}>View medical history</button></div>
        <p>Clinical records are maintained by authorized doctors and remain available to you through your own account. Your portal is read-only for clinical information.</p>
      </div>
    </RoleLayout>
  );
};

export default WorkerDashboard;
