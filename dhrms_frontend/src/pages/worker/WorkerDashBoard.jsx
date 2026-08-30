import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RoleLayout from "../../components/RoleLayout";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = useMemo(
    () => [
      {
        label: "My Profile",
        onClick: () => navigate("/worker/profile"),
      },
      {
        label: "Medical History",
        onClick: () => navigate("/worker/medical-history"),
        variant: "secondary",
      },
    ],
    [navigate],
  );

  return (
    <RoleLayout
      title="Worker Dashboard"
      description="Access your personal profile and medical history from one polished workspace."
      actions={actions}
    >
      <div className="card-row">
        <article className="card">
          <h3>Welcome back</h3>
          <p>
            <strong>Email:</strong> {user?.email || "Not available"}
          </p>
          <p>
            <strong>Role:</strong> {user?.role || "Worker"}
          </p>
          <p className="muted">
            Check your latest medical updates and profile at a glance.
          </p>
        </article>

        <article className="card">
          <h3>Quick access</h3>
          <p>Jump straight to your profile or review your medical history.</p>
          <div className="page-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => navigate("/worker/profile")}
            >
              My Profile
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigate("/worker/medical-history")}
            >
              Medical History
            </button>
          </div>
        </article>
      </div>
    </RoleLayout>
  );
};

export default WorkerDashboard;
