import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorker } from "../../services/workerService";
import MedicalRecords from "./MedicalRecords";

const DoctorWorkerProfile = () => {
  const { workerId } = useParams(); const navigate = useNavigate(); const [worker, setWorker] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { getMyWorker(workerId).then(setWorker).catch((err) => setError(err.response?.data?.error || "You are not authorized to access this worker.")).finally(() => setLoading(false)); }, [workerId]);
  return <RoleLayout title="Worker profile" description="Review the assigned worker and maintain their clinical records.">
    {loading && <div className="loading-card">Loading worker profile...</div>}
    {error && <div className="alert error">{error}<button className="button button-secondary button-small" onClick={() => navigate("/doctor/workers")}>Back to workers</button></div>}
    {worker && <><div className="card worker-profile-header"><div className="person-cell"><span className="avatar">{(worker.fullName || "W").charAt(0)}</span><div><span className="eyebrow">Worker ID {worker.workerCode}</span><h2>{worker.fullName}</h2><p>{worker.phone || "No phone number"}</p></div></div><button className="button button-secondary" onClick={() => navigate("/doctor/workers")}>← My workers</button></div><div className="profile-grid"><div><small>Date of birth</small><strong>{worker.dateOfBirth || "—"}</strong></div><div><small>Gender</small><strong>{worker.gender || "—"}</strong></div><div><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></div><div><small>Phone</small><strong>{worker.phone || "—"}</strong></div><div className="profile-span"><small>Address</small><strong>{worker.address || "—"}</strong></div></div><MedicalRecords workerId={workerId} /></>}
  </RoleLayout>;
};
export default DoctorWorkerProfile;
