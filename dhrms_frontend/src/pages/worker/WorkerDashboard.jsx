import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkerProfile } from "../../services/workerService";
import { getApiError } from "../../services/api";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyWorkerProfile().then(setProfile).catch((err) => setError(getApiError(err, "Unable to load your dashboard."))).finally(() => setLoading(false));
  }, []);

  if (loading) return <RoleLayout title="My health"><div className="loading-card">Loading your health workspace…</div></RoleLayout>;
  if (error) return <RoleLayout title="My health"><div className="alert error">{error}</div></RoleLayout>;

  return <RoleLayout title={`Welcome, ${profile.fullName}`} description={`Worker ID ${profile.workerCode}`} actions={[{ label: "Medical history", onClick: () => navigate("/worker/medical-history") }, { label: "My profile", onClick: () => navigate("/worker/profile"), variant: "secondary" }]}>
    <div className="dashboard-welcome"><div><span className="eyebrow">Personal health workspace</span><h2>Your care information, in one place.</h2><p>See your current hospital, assigned doctor and medical history without navigating through unrelated hospital workflows.</p></div><div className="dashboard-mark">W</div></div>
    <div className="card-row"><article className="card"><span className="eyebrow">Current hospital</span><h2>{profile.hospital?.name || "Not assigned"}</h2><p>{profile.hospital?.code || "No hospital relationship yet"}{profile.hospital?.city ? ` · ${profile.hospital.city}` : ""}</p></article><article className="card"><span className="eyebrow">Assigned doctor</span><h2>{profile.assignedDoctor?.name || "Not assigned"}</h2><p>{profile.assignedDoctor?.specialization || "Your hospital can assign a doctor from your worker profile."}</p></article><article className="card"><span className="eyebrow">Worker status</span><h2>{profile.active ? "ACTIVE" : "INACTIVE"}</h2><p>Your DHRMS identity remains tied to your worker profile.</p></article></div>
    <div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Next step</span><h2>Review your records</h2></div><button className="button button-primary" onClick={() => navigate("/worker/medical-history")}>View medical history</button></div><p>Clinical records are maintained by authorized doctors and remain available to you through your own account.</p></div>
  </RoleLayout>;
};

export default WorkerDashboard;
