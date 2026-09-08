import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";

const ArrowIcon = ({ direction = "right" }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">
    {direction === "left" ? (
      <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" />
    ) : (
      <path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" />
    )}
  </svg>
);

const LoginIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">
    <path d="M11 4h5v12h-5M10 10H4m0 0 3-3M4 10l3 3" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="role-login-feature-icon">
    <path d="M12 3.5 19 6v5.4c0 4.4-2.7 7.6-7 9.1-4.3-1.5-7-4.7-7-9.1V6l7-2.5Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const RecordIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="role-login-feature-icon">
    <rect x="5" y="3.5" width="14" height="17" rx="2" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </svg>
);

const roleConfig = {
  REGISTRATION_OFFICER: {
    label: "Registration Officer",
    description: "Register workers, verify identity and maintain accurate DHRMS records.",
    redirect: "/registration",
    code: "R",
    headline: "Keep worker identity records accurate from the start.",
    visual: "Registration and identity management",
  },
  HOSPITAL: {
    label: "Hospital",
    description: "Manage workers, doctors and healthcare workflows from one secure workspace.",
    redirect: "/hospital",
    code: "H",
    headline: "Coordinate workforce care with confidence.",
    visual: "Hospital workforce management",
  },
  DOCTOR: {
    label: "Doctor",
    description: "Manage assigned workers and maintain the clinical records relevant to their care.",
    redirect: "/doctor",
    code: "D",
    headline: "The clinical information you need, in one place.",
    visual: "Clinical records and assigned workers",
  },
  WORKER: {
    label: "Worker",
    description: "Access your profile, verified QR identity and personal health records.",
    redirect: "/worker",
    code: "W",
    headline: "Your verified identity and health record, securely accessible.",
    visual: "Worker identity and health records",
  },
};

const RoleLogin = ({ role }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const config = roleConfig[role];
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(
    searchParams.get("reason") === "session-expired"
      ? "Your session has expired. Please sign in again."
      : ""
  );
  const [loading, setLoading] = useState(false);

  if (!config) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(form.email, form.password);
      if (response.role !== role) {
        setError(`This account does not have ${config.label.toLowerCase()} access.`);
        return;
      }
      loginUser(response);
      navigate(config.redirect, { replace: true });
    } catch (err) {
      setError(getApiError(err, "We couldn't sign you in. Check your credentials and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-auth-shell role-login-shell">
      <div className="public-auth-wrap role-login-wrap">
        <div className="public-auth-card role-login-card">
          <section className="role-login-visual">
            <button
              className="public-icon-btn role-login-back"
              type="button"
              onClick={() => navigate("/login")}
              title="Back to portal selection"
              aria-label="Back to portal selection"
            >
              <ArrowIcon direction="left" />
            </button>

            <div className="role-login-visual-content">
              <span className="public-kicker">{config.visual}</span>
              <div className={`role-login-mark role-${config.code.toLowerCase()}`}>{config.code}</div>
              <h1>{config.headline}</h1>
              <p>{config.description}</p>

              <div className="role-login-trust">
                <div>
                  <ShieldIcon />
                  <span>Role-based access to protected records</span>
                </div>
                <div>
                  <RecordIcon />
                  <span>Information presented according to your role</span>
                </div>
              </div>
            </div>

            <div className="role-login-visual-meta">
              <span>Secure access</span>
              <span aria-hidden="true">•</span>
              <span>{config.label}</span>
            </div>
          </section>

          <main className="role-login-form-panel">
            <div className="role-login-form-inner">
              <div className="role-login-heading">
                <span className="role-login-code">{config.code} / {config.label}</span>
                <h2>Sign in to your workspace</h2>
                <p>Use your registered credentials to continue.</p>
              </div>

              {error && <div className="public-alert public-alert-error" role="alert">{error}</div>}

              <form onSubmit={handleSubmit} className="public-form role-login-form">
                <div className="public-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    className="public-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                    placeholder="name@organisation.com"
                  />
                </div>

                <div className="public-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    className="public-input"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                </div>

                <button type="submit" className="public-btn public-btn-primary public-submit role-login-submit" disabled={loading}>
                  <span>{loading ? "Signing in…" : "Sign in"}</span>
                  {loading ? null : <LoginIcon />}
                </button>
              </form>

              <div className="role-login-links">
                <span>Need a different portal?</span>
                <Link to="/login" className="role-login-portal-link">
                  Select another portal <ArrowIcon />
                </Link>
              </div>

              {role === "HOSPITAL" && (
                <div className="role-login-register-note">
                  <span>New hospital to DHRMS?</span>
                  <Link to="/hospital/register">Register your hospital</Link>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoleLogin;
