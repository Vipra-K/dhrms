import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { getWorker, terminateHospitalRelationship } from "../../services/workerService";

const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null); const [loading, setLoading] = useState(true); const [terminating, setTerminating] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  useEffect(() => { let ignore = false; const fetchWorker = async () => { try { setError(""); const data = await getWorker(workerId); if (!ignore) setWorker(data); } catch (err) { if (!ignore) setError(getApiError(err, "Unable to load worker.")); } finally { if (!ignore) setLoading(false); } }; fetchWorker(); return () => { ignore = true; }; }, [workerId]);
  const handleTerminateRelationship = async () => {
    if (!window.confirm("End this worker's relationship with this hospital?")) return;
    setTerminating(true); setError(""); setSuccess("");
    try { await terminateHospitalRelationship(workerId); setSuccess("Hospital relationship ended."); setTimeout(() => navigate("/hospital/workers", { replace: true }), 700); }
    catch (err) { setError(getApiError(err, "Unable to end hospital relationship.")); } finally { setTerminating(false); }
  };
  if (loading) return <RoleLayout title="Worker profile"><div className="loading-card">Loading worker…</div></RoleLayout>;
  if (error && !worker) return <RoleLayout title="Worker profile"><div className="alert error">{error}</div><button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>Back</button></RoleLayout>;
  if (!worker) return <RoleLayout title="Worker profile"><div className="empty-state-card"><h3>Worker not found</h3><button className="button button-primary" onClick={() => navigate("/hospital/workers")}>Back</button></div></RoleLayout>;
  return <RoleLayout title={worker.fullName} description={`Worker ID ${worker.workerCode}`} actions={[{ label: "Back to workers", onClick: () => navigate("/hospital/workers"), variant: "secondary" }]}>
    {(error || success) && <div className={`alert ${error ? "error" : "success"}`}>{error || success}</div>}
    <div className="card worker-profile-header"><div className="person-cell"><span className="avatar">{worker.fullName.charAt(0)}</span><div><span className="eyebrow">Worker</span><h2>{worker.fullName}</h2><p>{worker.workerCode}</p></div></div><span className={`status-badge ${worker.active ? "status-active" : "status-inactive"}`}>{worker.active ? "ACTIVE" : "INACTIVE"}</span></div>
    <div className="profile-grid"><div><small>Date of birth</small><strong>{worker.dateOfBirth || "—"}</strong></div><div><small>Gender</small><strong>{worker.gender || "—"}</strong></div><div><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></div><div><small>Phone</small><strong>{worker.phone || "—"}</strong></div><div className="profile-span"><small>Address</small><strong>{worker.address || "—"}</strong></div></div>
    <div className="card"><div className="section-toolbar"><div><span className="eyebrow">Hospital</span><h2>Hospital relationship</h2><p>Current association with this hospital.</p></div><span className="status-badge status-active">ACTIVE</span></div><div className="panel"><h3>End relationship</h3><p>The worker account and medical history will remain active.</p><button className="button button-primary" onClick={handleTerminateRelationship} disabled={terminating}>{terminating ? "Ending…" : "End relationship"}</button></div></div>
  </RoleLayout>;
};
export default WorkerProfile;
