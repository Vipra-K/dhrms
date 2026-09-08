import { useNavigate } from "react-router-dom";
import "./RoleLoginPicker.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.5 19 6v5.4c0 4.4-2.7 7.6-7 9.1-4.3-1.5-7-4.7-7-9.1V6l7-2.5Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const RecordIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="3.5" width="14" height="17" rx="2" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </svg>
);

const roles = [
  {
    label: "Registration Officer",
    code: "R",
    description: "Register workers and maintain verified identities.",
    path: "/login/registration-officer",
  },
  {
    label: "Hospital",
    code: "H",
    description: "Manage workers, doctors and healthcare services.",
    path: "/login/hospital",
  },
  {
    label: "Doctor",
    code: "D",
    description: "Access assigned workers and clinical records.",
    path: "/login/doctor",
  },
  {
    label: "Worker",
    code: "W",
    description: "View your identity, profile and health records.",
    path: "/login/worker",
  },
];

const RoleLoginPicker = () => {
  const navigate = useNavigate();

  return (
    <div className="login-picker-page">
      <main className="login-picker-shell">
        <section className="login-picker-intro">
          <button
            className="login-picker-back"
            type="button"
            onClick={() => navigate("/")}
            title="Back to home"
            aria-label="Back to home"
          >
            <BackIcon />
          </button>

          <div className="login-picker-intro-content">
            <span className="login-picker-kicker">Secure healthcare access</span>
            <h2>One secure system for every DHRMS role.</h2>
            <p>
              Access the tools and records relevant to your responsibilities,
              with role-based access designed for secure healthcare workflows.
            </p>

            <div className="login-picker-features">
              <div><ShieldIcon /><span>Role-based access to protected records</span></div>
              <div><RecordIcon /><span>Connected health records for every worker</span></div>
            </div>
          </div>

          <span className="login-picker-footnote">PEOPLE · RECORDS · BETTER CARE</span>
        </section>

        <section className="login-picker-content">
          <div className="login-picker-heading">
            <span className="login-picker-kicker">Secure access</span>
            <h1>Select your DHRMS portal</h1>
            <p>Choose the portal that matches your account to continue.</p>
          </div>

          <div className="login-picker-grid">
            {roles.map((role) => (
              <button
                key={role.label}
                className="login-picker-role"
                type="button"
                onClick={() => navigate(role.path)}
              >
                <span className={`login-picker-role-icon role-${role.code.toLowerCase()}`}>
                  {role.code}
                </span>
                <span className="login-picker-role-copy">
                  <strong>{role.label}</strong>
                  <small>{role.description}</small>
                </span>
                <span className="login-picker-arrow"><ArrowIcon /></span>
              </button>
            ))}
          </div>

          <button
            className="login-picker-register"
            type="button"
            onClick={() => navigate("/hospital/register")}
          >
            <span className="login-picker-register-icon">+</span>
            <span className="login-picker-register-copy">
              <strong>Register a hospital</strong>
              <small>Create a hospital account and set up your DHRMS workspace.</small>
            </span>
            <span className="login-picker-arrow"><ArrowIcon /></span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default RoleLoginPicker;
