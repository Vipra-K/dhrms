import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleLayout from "../components/RoleLayout";

const HospitalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <RoleLayout
      title="Hospital Dashboard"
      description={`Welcome back, ${user?.email}`}
    >
      <div className="card-grid">
        <article className="card">
          <h3>Manage Doctors</h3>
          <p>Register, suspend, or manage hospital doctors.</p>
          <button className="button button-primary mt-4" onClick={() => navigate("/hospital/doctors")}>
            View Doctors
          </button>
        </article>

        <article className="card">
          <h3>Manage Workers</h3>
          <p>Register and manage migration worker profiles.</p>
          <button className="button button-primary mt-4" onClick={() => navigate("/hospital/workers")}>
            View Workers
          </button>
        </article>

        <article className="card">
          <h3>Scan Worker QR</h3>
          <p>Scan a worker's QR code to view their medical profile.</p>
          <button className="button button-secondary mt-4" onClick={() => navigate("/hospital/workers/scan")}>
            Open Scanner
          </button>
        </article>

        <article className="card">
          <h3>Find Worker</h3>
          <p>Search for a specific worker by their unique ID.</p>
          <button className="button button-secondary mt-4" onClick={() => navigate("/hospital/find-worker")}>
            Search Database
          </button>
        </article>
      </div>
    </RoleLayout>
  );
};

export default HospitalDashboard;
