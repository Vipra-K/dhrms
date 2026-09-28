import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorker } from "../../services/workerService";
import MedicalRecords from "./MedicalRecords";
import "./medical-records.css";
import "./doctor-pages.css";

const DoctorWorkerProfile = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyWorker(workerId)
      .then(setWorker)
      .catch((err) => setError(err.response?.data?.error || "Unable to load worker details."))
      .finally(() => setLoading(false));
  }, [workerId]);

  return (
    <RoleLayout title="Worker profile" actions={[{ label: "Back", onClick: () => navigate("/doctor/workers"), variant: "secondary" }]}>
      <div className="doctor-page">
        {loading && <div className="loading-card">Loading worker…</div>}
        {error && <div className="alert error" role="alert">{error}</div>}

        {worker && (
          <>
            <section className="profile-hero panel">
              <div className="profile-info">
                <span className="profile-avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span>
                <div>
                  <h2>{worker.fullName}</h2>
                  <p>{worker.workerCode}</p>
                </div>
              </div>
              <span className="status-badge status-active">Active</span>
            </section>

            <section className="info-grid">
              <div className="info-item"><small>Date of birth</small><strong>{worker.dateOfBirth || "—"}</strong></div>
              <div className="info-item"><small>Gender</small><strong>{worker.gender || "—"}</strong></div>
              <div className="info-item"><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></div>
              <div className="info-item"><small>Phone</small><strong>{worker.phone || "—"}</strong></div>
              <div className="info-item" style={{ gridColumn: "1 / -1" }}><small>Address</small><strong>{worker.address || "—"}</strong></div>
            </section>

            <MedicalRecords workerId={workerId} />
          </>
        )}
      </div>
    </RoleLayout>
  );
};

export default DoctorWorkerProfile;
