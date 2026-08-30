import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyDoctorProfile } from "../../services/doctorService";
import RoleLayout from "../../components/RoleLayout";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyDoctorProfile();
        setDoctor(data);
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to load doctor profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const actions = useMemo(
    () => [
      {
        label: "My Workers",
        onClick: () => navigate("/doctor/workers"),
      },
    ],
    [navigate],
  );

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-card">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area">
        <div className="alert error">{error}</div>
      </div>
    );
  }

  return (
    <RoleLayout
      title="Doctor Dashboard"
      description="Overview of your profile and current worker assignments."
      actions={actions}
    >
      <div className="card-row">
        <article className="card">
          <h3>Your profile</h3>
          <p>
            <strong>Name:</strong> {doctor.fullName}
          </p>
          <p>
            <strong>Email:</strong> {doctor.email}
          </p>
          <p>
            <strong>Specialization:</strong>{" "}
            {doctor.specialization || "Not specified"}
          </p>
          <p>
            <strong>Department:</strong> {doctor.department || "Not specified"}
          </p>
          <p>
            <strong>License:</strong> {doctor.licenseNumber || "Not specified"}
          </p>
        </article>

        <article className="card">
          <h3>Next steps</h3>
          <p>
            Open your assigned workers and add medical records from the worker
            profile.
          </p>
          <div className="page-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => navigate("/doctor/workers")}
            >
              View Workers
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigate("/doctor/workers")}
            >
              Medical Records
            </button>
          </div>
        </article>
      </div>
    </RoleLayout>
  );
};

export default DoctorDashboard;
