import { useNavigate } from "react-router-dom";

const ArrowIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon"><path d="M7.5 4.5 13 10l-5.5 5.5M4 10h9" /></svg>;
const BackIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon"><path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" /></svg>;

const roles = [
  { label: "Registration Officer", code: "R", description: "Register workers, verify identity and issue DHRMS identities.", path: "/login/registration-officer" },
  { label: "Hospital", code: "H", description: "Manage workers, doctors and healthcare visits.", path: "/login/hospital" },
  { label: "Doctor", code: "D", description: "Handle assigned workers and clinical records.", path: "/login/doctor" },
  { label: "Worker", code: "W", description: "View your profile, QR identity and health records.", path: "/login/worker" },
];

const RoleLoginPicker = () => {
  const navigate = useNavigate();
  return (
    <div className="public-auth-shell">
      <div className="public-auth-wrap">
        <main className="public-role-picker">
          <button className="public-icon-btn public-back-icon" type="button" onClick={() => navigate("/")} title="Back to DHRMS home" aria-label="Back to DHRMS home"><BackIcon /></button>
          <div className="public-role-picker-head">
            <span className="public-kicker">Secure portal access</span>
            <h1>Choose your portal</h1>
            <p>Select the role that matches your DHRMS account.</p>
          </div>
          <div className="public-role-grid">
            {roles.map((role) => (
              <button key={role.label} className="public-role-card" type="button" onClick={() => navigate(role.path)}>
                <span className="public-role-icon">{role.code}</span>
                <span><strong>{role.label}</strong><small>{role.description}</small></span>
                <span className="public-role-arrow"><ArrowIcon /></span>
              </button>
            ))}
          </div>
          <button className="public-register-banner" type="button" onClick={() => navigate("/hospital/register")}>
            <span className="public-register-banner-icon">+</span>
            <span><strong>Need a hospital account?</strong><small>Register your hospital to get started.</small></span>
            <ArrowIcon />
          </button>
        </main>
      </div>
    </div>
  );
};

export default RoleLoginPicker;
