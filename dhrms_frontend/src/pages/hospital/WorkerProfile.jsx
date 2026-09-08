import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getHospitalDoctors } from "../../services/doctorService";
import { getApiError } from "../../services/api";
import { assignWorkerToDoctor, getWorker, getWorkerAssignmentHistory } from "../../services/workerService";

const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [history, setHistory] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [showAssignment, setShowAssignment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      const [workerData, assignmentHistory] = await Promise.all([getWorker(workerId), getWorkerAssignmentHistory(workerId)]);
      setWorker(workerData);
      setHistory(assignmentHistory);
    } catch (err) {
      setError(getApiError(err, "Unable to load worker profile."));
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      try {
        const [workerData, assignmentHistory] = await Promise.all([getWorker(workerId), getWorkerAssignmentHistory(workerId)]);
        if (!ignore) {
          setWorker(workerData);
          setHistory(assignmentHistory);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiError(err, "Unable to load worker profile."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetch();
    return () => {
      ignore = true;
    };
  }, [workerId]);

  const openAssignment = async () => {
    try { setError(""); setDoctors(await getHospitalDoctors()); setShowAssignment(true); }
    catch (err) { setError(getApiError(err, "Unable to load active doctors.")); }
  };

  const handleAssign = async () => {
    if (!selectedDoctorId) { setError("Select a doctor before continuing."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      await assignWorkerToDoctor(workerId, String(selectedDoctorId));
      await load();
      setSelectedDoctorId(""); setShowAssignment(false);
      setSuccess("Doctor assignment updated. The previous assignment is preserved in history.");
    } catch (err) { setError(getApiError(err, "Unable to update doctor assignment.")); }
    finally { setSaving(false); }
  };

  if (loading) return <RoleLayout title="Worker profile"><div className="loading-card">Loading worker profile…</div></RoleLayout>;
  if (error && !worker) return <RoleLayout title="Worker profile"><div className="alert error">{error}<button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>Back to workers</button></div></RoleLayout>;
  if (!worker) return <RoleLayout title="Worker profile"><div className="empty-state-card"><h3>Worker not found</h3><button className="button button-primary" onClick={() => navigate("/hospital/workers")}>Back to workers</button></div></RoleLayout>;

  const assignedDoctor = worker.assignedDoctor;

  return <RoleLayout title={worker.fullName} description={`Worker ID ${worker.workerCode}`} actions={[{ label: "Back to workers", onClick: () => navigate("/hospital/workers"), variant: "secondary" }, { label: assignedDoctor ? "Change doctor" : "Assign doctor", onClick: openAssignment }]}>
    {(error || success) && <div className={`alert ${error ? "error" : "success"}`}>{error || success}</div>}
    <div className="card worker-profile-header"><div className="person-cell"><span className="avatar">{worker.fullName.charAt(0)}</span><div><span className="eyebrow">{worker.active ? "Active worker" : "Inactive worker"}</span><h2>{worker.fullName}</h2><p>{worker.workerCode}</p></div></div><span className={`status-badge ${worker.active ? "status-active" : "status-inactive"}`}>{worker.active ? "ACTIVE" : "INACTIVE"}</span></div>
    <div className="profile-grid"><div><small>Date of birth</small><strong>{worker.dateOfBirth || "—"}</strong></div><div><small>Gender</small><strong>{worker.gender || "—"}</strong></div><div><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></div><div><small>Phone</small><strong>{worker.phone || "—"}</strong></div><div className="profile-span"><small>Address</small><strong>{worker.address || "—"}</strong></div></div>
    <div className="card"><div className="section-toolbar"><div><span className="eyebrow">Care relationship</span><h2>Current doctor</h2></div><button className="button button-secondary" onClick={openAssignment}>{assignedDoctor ? "Change doctor" : "Assign doctor"}</button></div>{assignedDoctor ? <div className="person-cell"><span className="avatar">{assignedDoctor.name.charAt(0)}</span><div><strong>{assignedDoctor.name}</strong><small>{assignedDoctor.specialization || "General care"} · Assigned {new Date(assignedDoctor.assignedAt).toLocaleDateString()}</small></div></div> : <div className="empty-state-card"><h3>No current doctor</h3><p>This worker is registered but still needs a doctor assignment.</p></div>}
      {showAssignment && <div className="panel"><h3>{assignedDoctor ? "Reassign doctor" : "Assign doctor"}</h3><p>The current assignment will be ended and retained in assignment history.</p><select className="select" value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}><option value="">Select an active doctor</option>{doctors.filter((doctor) => doctor.status === "ACTIVE" && doctor.role !== "READ_ONLY").map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}</option>)}</select><div className="modal-actions"><button className="button button-secondary" onClick={() => setShowAssignment(false)}>Cancel</button><button className="button button-primary" onClick={handleAssign} disabled={saving}>{saving ? "Updating…" : assignedDoctor ? "Confirm reassignment" : "Confirm assignment"}</button></div></div>}
    </div>
    <div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Audit trail</span><h2>Assignment history</h2><p>Every previous doctor relationship stays visible.</p></div></div>{history.length === 0 ? <div className="empty-state-card"><h3>No assignment history</h3><p>Assign a doctor to begin the worker's care lifecycle.</p></div> : <div className="table-card"><table className="table"><thead><tr><th>Doctor</th><th>Started</th><th>Ended</th><th>Status</th></tr></thead><tbody>{history.map((item) => <tr key={item.id}><td><strong>{item.doctorName}</strong><small>{item.doctorSpecialization || ""}</small></td><td>{new Date(item.assignedAt).toLocaleDateString()}</td><td>{item.endedAt ? new Date(item.endedAt).toLocaleDateString() : "—"}</td><td><span className={`status-badge ${item.active ? "status-active" : "status-inactive"}`}>{item.status}</span></td></tr>)}</tbody></table></div>}</div>
    <div className="card"><div className="section-toolbar"><div><span className="eyebrow">Clinical workspace</span><h2>Medical information</h2><p>Doctors maintain clinical records; the worker can review them from their own portal.</p></div><span className="status-badge status-active">Access controlled</span></div></div>
  </RoleLayout>;
};

export default WorkerProfile;
