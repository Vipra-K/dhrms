import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homeByRole = { HOSPITAL: "/hospital", DOCTOR: "/doctor", WORKER: "/worker", REGISTRATION_OFFICER: "/registration" };

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="public-auth-shell"><div className="public-auth-wrap"><main className="public-auth-card public-denied">
      <div className="public-denied-icon">!</div>
      <span className="public-kicker">Access restricted</span>
      <h1 style={{ marginTop: 12 }}>This workspace isn't available to your account.</h1>
      <p>Your account is signed in, but this page belongs to a different DHRMS role. Return to your own workspace or choose another portal.</p>
      <div className="public-actions" style={{ justifyContent: "center" }}>
        <button className="public-btn public-btn-primary" type="button" onClick={() => navigate(homeByRole[user?.role] || "/login")}>Back to my workspace</button>
        <button className="public-btn public-btn-secondary" type="button" onClick={() => navigate("/login")}>Choose another portal</button>
      </div>
    </main></div></div>
  );
};
export default Unauthorized;
