import { useNavigate } from "react-router-dom";

const roles = [
  { label: "Registration Officer", code: "R", description: "Register workers, verify identity and issue DHRMS identities.", path: "/login/registration-officer" },
  { label: "Hospital", code: "H", description: "Manage workers, doctors and healthcare visits from one operational workspace.", path: "/login/hospital" },
  { label: "Doctor", code: "D", description: "Handle assigned workers and clinical records.", path: "/login/doctor" },
  { label: "Worker", code: "W", description: "View your profile, QR identity and health records.", path: "/login/worker" },
];

const RoleLoginPicker = () => {
  const navigate = useNavigate();
  return (
    <div className="public-auth-shell">
      <div className="public-auth-wrap">
        <main className="public-role-picker">
          <button className="public-back" type="button" onClick={() => navigate("/")} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #202a38", background: "#111722", color: "#9ca7b8", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>← Back to DHRMS home</button>
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
                <span className="public-role-arrow">→</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="public-btn public-btn-secondary" style={{ width: "100%" }} type="button" onClick={() => navigate("/hospital/register")}>Need a hospital account? Register a hospital</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoleLoginPicker;
