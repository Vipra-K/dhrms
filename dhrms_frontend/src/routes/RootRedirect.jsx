import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const dashboardByRole = {
  REGISTRATION_OFFICER: "/registration",
  HOSPITAL: "/hospital",
  DOCTOR: "/doctor",
  WORKER: "/worker",
};

const RootRedirect = () => {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) return <div className="loading-card">Restoring your session…</div>;

  if (!isAuthenticated) return <Navigate to="/home" replace />;

  return <Navigate to={dashboardByRole[user.role] || "/unauthorized"} replace />;
};

export default RootRedirect;
