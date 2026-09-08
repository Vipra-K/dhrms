import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homeByRole = { HOSPITAL: "/hospital", DOCTOR: "/doctor", WORKER: "/worker", REGISTRATION_OFFICER: "/registration" };
const ArrowIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon"><path d="M7.5 4.5 13 10l-5.5 5.5M4 10h9" /></svg>;
const BackIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon"><path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" /></svg>;

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="public-auth-shell"><div className="public-auth-wrap"><main className="public-auth-card public-denied">
      <button className="public-icon-btn public-back-icon" type="button" onClick={() => navigate("/")} title="Back to DHRMS home" aria-label="Back to DHRMS home"><BackIcon /></button>
      <div className="public-denied-icon">!</div>
      <span className="public-kicker">Access restricted</span>
      <h1>You don't have access to this workspace.</h1>
      <p>Your account is signed in, but this area is restricted to a different DHRMS role. Return to your workspace or select the appropriate portal.</p>
      <div className="public-actions" style={{ justifyContent: "center" }}>
        <button className="public-btn public-btn-primary" type="button" onClick={() => navigate(homeByRole[user?.role] || "/login")}>My workspace <ArrowIcon /></button>
        <button className="public-btn public-btn-secondary" type="button" onClick={() => navigate("/login")}>Select a portal <ArrowIcon /></button>
      </div>
    </main></div></div>
  );
};
export default Unauthorized;
