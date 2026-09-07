import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homeByRole = { HOSPITAL: "/hospital", DOCTOR: "/doctor", WORKER: "/worker" };

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <span className="eyebrow">Access denied</span>
        <h1>You don't have permission to view this page.</h1>
        <p>Your account is signed in, but this workspace belongs to another role.</p>
        <button className="button button-primary button-full" onClick={() => navigate(homeByRole[user?.role] || "/login")}>
          Back to my dashboard
        </button>
      </main>
    </div>
  );
};

export default Unauthorized;
