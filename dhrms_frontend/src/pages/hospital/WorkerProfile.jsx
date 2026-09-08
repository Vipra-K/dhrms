import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { getWorker, terminateHospitalRelationship } from "../../services/workerService";

const WorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchWorker = async () => {
      try {
        setError("");
        const workerData = await getWorker(workerId);
        if (!ignore) setWorker(workerData);
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Unable to load worker profile."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchWorker();
    return () => {
      ignore = true;
    };
  }, [workerId]);

  const handleTerminateRelationship = async () => {
    const confirmed = window.confirm(
      "End this worker's relationship with this hospital? The worker account and medical history will remain active, but this hospital will no longer be able to start new visits for the worker."
    );
    if (!confirmed) return;

    setTerminating(true);
    setError("");
    setSuccess("");
    try {
      await terminateHospitalRelationship(workerId);
      setSuccess("The hospital-worker relationship has been terminated.");
      setTimeout(() => navigate("/hospital/workers", { replace: true }), 700);
    } catch (err) {
      setError(getApiError(err, "Unable to terminate the hospital relationship."));
    } finally {
      setTerminating(false);
    }
  };

  if (loading) return <RoleLayout title="Worker profile"><div className="loading-card">Loading worker profile…</div></RoleLayout>;
  if (error && !worker) return <RoleLayout title="Worker profile"><div className="alert error">{error}<button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>Back to workers</button></div></RoleLayout>;
  if (!worker) return <RoleLayout title="Worker profile"><div className="empty-state-card"><h3>Worker not found</h3><button className="button button-primary" onClick={() => navigate("/hospital/workers")}>Back to workers</button></div></RoleLayout>;

  return <RoleLayout
    title={worker.fullName}
    description={`Worker ID ${worker.workerCode}`}
    actions={[{ label: "Back to workers", onClick: () => navigate("/hospital/workers"), variant: "secondary" }]}
  >
    {(error || success) && <div className={`alert ${error ? "error" : "success"}`}>{error || success}</div>}

    <div className="card worker-profile-header">
      <div className="person-cell">
        <span className="avatar">{worker.fullName.charAt(0)}</span>
        <div>
          <span className="eyebrow">{worker.active ? "Active worker" : "Inactive worker"}</span>
          <h2>{worker.fullName}</h2>
          <p>{worker.workerCode}</p>
        </div>
      </div>
      <span className={`status-badge ${worker.active ? "status-active" : "status-inactive"}`}>
        {worker.active ? "ACTIVE" : "INACTIVE"}
      </span>
    </div>

    <div className="profile-grid">
      <div><small>Date of birth</small><strong>{worker.dateOfBirth || "—"}</strong></div>
      <div><small>Gender</small><strong>{worker.gender || "—"}</strong></div>
      <div><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></div>
      <div><small>Phone</small><strong>{worker.phone || "—"}</strong></div>
      <div className="profile-span"><small>Address</small><strong>{worker.address || "—"}</strong></div>
    </div>

    <div className="card">
      <div className="section-toolbar">
        <div>
          <span className="eyebrow">Hospital relationship</span>
          <h2>Current hospital relationship</h2>
          <p>
            This relationship is independent of individual doctor visits. Completing a visit does not end the worker's relationship with this hospital.
          </p>
        </div>
        <span className="status-badge status-active">ACTIVE</span>
      </div>
      <div className="panel">
        <h3>End hospital relationship</h3>
        <p>
          Use this only when the worker is no longer associated with this hospital. Their worker account, QR code, and medical history remain available.
        </p>
        <button className="button button-primary" onClick={handleTerminateRelationship} disabled={terminating}>
          {terminating ? "Terminating…" : "Terminate relationship"}
        </button>
      </div>
    </div>

    <div className="card">
      <div className="section-toolbar">
        <div>
          <span className="eyebrow">Clinical workspace</span>
          <h2>Medical information</h2>
          <p>Doctors maintain clinical records during visits; the worker can review their medical history from the worker portal.</p>
        </div>
        <span className="status-badge status-active">Access controlled</span>
      </div>
    </div>
  </RoleLayout>;
};

export default WorkerProfile;
