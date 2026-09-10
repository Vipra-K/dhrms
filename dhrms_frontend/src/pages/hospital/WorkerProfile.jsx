import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { getWorker, terminateHospitalRelationship } from "../../services/workerService";
import "./WorkerProfile.css";

const valueOrDash = (value) => value || "—";

const Detail = ({ label, value, full = false }) => (
  <div className={`worker-profile-detail ${full ? "full" : ""}`}>
    <span className="worker-profile-detail-label">{label}</span>
    <span className="worker-profile-detail-value">{valueOrDash(value)}</span>
  </div>
);

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
        const data = await getWorker(workerId);
        if (!ignore) setWorker(data);
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Unable to load worker."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchWorker();
    return () => { ignore = true; };
  }, [workerId]);

  const handleTerminateRelationship = async () => {
    if (!window.confirm("End this worker's relationship with this hospital?")) return;
    setTerminating(true);
    setError("");
    setSuccess("");
    try {
      await terminateHospitalRelationship(workerId);
      setSuccess("Hospital relationship ended.");
      setTimeout(() => navigate("/hospital/workers", { replace: true }), 700);
    } catch (err) {
      setError(getApiError(err, "Unable to end hospital relationship."));
    } finally {
      setTerminating(false);
    }
  };

  if (loading) {
    return <RoleLayout title="Worker profile"><div className="loading-card worker-profile-loading">Loading worker…</div></RoleLayout>;
  }

  if (error && !worker) {
    return (
      <RoleLayout title="Worker profile">
        <div className="worker-profile-page">
          <div className="alert error worker-profile-error">{error}</div>
          <div><button className="button button-secondary" onClick={() => navigate("/hospital/workers")}>Back to workers</button></div>
        </div>
      </RoleLayout>
    );
  }

  if (!worker) {
    return (
      <RoleLayout title="Worker profile">
        <div className="empty-state-card">
          <h3>Worker not found</h3>
          <p>The worker record could not be found or is no longer available.</p>
          <button className="button button-primary" onClick={() => navigate("/hospital/workers")}>Back to workers</button>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout
      title="Worker profile"
      description="View worker information and hospital relationship status."
      actions={[{ label: "Back to workers", onClick: () => navigate("/hospital/workers"), variant: "secondary" }]}
    >
      <div className="worker-profile-page">
        {(error || success) && <div className={`alert ${error ? "error" : "success"}`}>{error || success}</div>}

        <section className="worker-profile-hero">
          <div className="worker-profile-identity">
            <div className="worker-profile-avatar" aria-hidden="true">
              {worker.fullName?.charAt(0)?.toUpperCase() || "W"}
            </div>
            <div>
              <span className="eyebrow">Worker</span>
              <h2 className="worker-profile-name">{worker.fullName}</h2>
              <p className="worker-profile-code">{worker.workerCode}</p>
            </div>
          </div>
          <div className="worker-profile-hero-side">
            <span className={`worker-profile-status ${worker.active ? "" : "inactive"}`}>
              <span aria-hidden="true">●</span>{worker.active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </section>

        <div className="worker-profile-section-grid">
          <section className="worker-profile-card">
            <div className="worker-profile-card-header">
              <div>
                <span className="eyebrow">Personal information</span>
                <h2>Identity details</h2>
              </div>
            </div>
            <div className="worker-profile-details">
              <Detail label="Worker ID" value={worker.workerCode} />
              <Detail label="Date of birth" value={worker.dateOfBirth} />
              <Detail label="Gender" value={worker.gender} />
              <Detail label="Blood group" value={worker.bloodGroup} />
            </div>
          </section>

          <section className="worker-profile-card">
            <div className="worker-profile-card-header">
              <div>
                <span className="eyebrow">Contact information</span>
                <h2>Contact & address</h2>
              </div>
            </div>
            <div className="worker-profile-details">
              <Detail label="Phone" value={worker.phone} />
              <Detail label="Address" value={worker.address} full />
            </div>
          </section>
        </div>

        <section className="worker-profile-relationship">
          <div className="worker-profile-relationship-copy">
            <div className="worker-profile-relationship-icon" aria-hidden="true">H</div>
            <div>
              <span className="eyebrow">Hospital relationship</span>
              <h2>Current hospital association</h2>
              <p>The worker account and medical history remain active independently of this hospital relationship.</p>
            </div>
          </div>
          <div className="worker-profile-danger">
            <div className="worker-profile-danger-copy">
              <strong>End relationship</strong>
              <span>Remove this worker from the hospital.</span>
            </div>
            <button className="button button-secondary" onClick={handleTerminateRelationship} disabled={terminating}>
              {terminating ? "Ending…" : "End relationship"}
            </button>
          </div>
        </section>
      </div>
    </RoleLayout>
  );
};

export default WorkerProfile;
