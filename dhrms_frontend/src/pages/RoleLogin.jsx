import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";

const roleConfig = {
  REGISTRATION_OFFICER: { label: "Registration Officer", description: "Register workers, verify identity and issue permanent DHRMS identities.", redirect: "/registration", code: "R" },
  HOSPITAL: { label: "Hospital", description: "Manage workers, doctors and healthcare visits from one operational workspace.", redirect: "/hospital", code: "H" },
  DOCTOR: { label: "Doctor", description: "Work with assigned workers and maintain clinical records and prescriptions.", redirect: "/doctor", code: "D" },
  WORKER: { label: "Worker", description: "Access your profile, QR identity and personal medical history.", redirect: "/worker", code: "W" },
};

const RoleLogin = ({ role }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const config = roleConfig[role];
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(searchParams.get("reason") === "session-expired" ? "Your session expired. Please sign in again." : "");
  const [loading, setLoading] = useState(false);

  if (!config) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(form.email, form.password);
      if (response.role !== role) {
        setError(`This is not a ${config.label.toLowerCase()} account.`);
        return;
      }
      loginUser(response);
      navigate(config.redirect, { replace: true });
    } catch (err) {
      setError(getApiError(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-auth-shell">
      <div className="public-auth-wrap">
        <div className="public-auth-card public-auth-split">
          <section className="public-auth-intro">
            <button className="public-brand" type="button" onClick={() => navigate("/")}><span className="public-brand-mark">D</span>DHRMS</button>
            <div style={{ marginTop: 48 }}><span className="public-kicker">{config.label} portal</span><h1>Healthcare records, without the clutter.</h1><p>{config.description}</p></div>
            <div className="public-auth-points"><div>✓ Secure role-based access</div><div>✓ Focused workspace for your role</div><div>✓ Fast access to relevant records</div></div>
          </section>

          <main className="public-auth-form">
            <button className="public-back" type="button" onClick={() => navigate("/login")} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #202a38", background: "#111722", color: "#9ca7b8", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>← Choose another portal</button>
            <div className="public-form-head"><span style={{ color: "#9da8ff", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>{config.code} / {config.label} access</span><h2>Welcome back</h2><p>Sign in with your DHRMS account to continue.</p></div>
            {error && <div className="public-alert public-alert-error" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} className="public-form">
              <div className="public-field"><label htmlFor="email">Email address</label><input id="email" className="public-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" placeholder="you@example.com" /></div>
              <div className="public-field"><label htmlFor="password">Password</label><input id="password" className="public-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" placeholder="Enter your password" /></div>
              <button type="submit" className="public-btn public-btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={loading}>{loading ? "Signing in…" : `Sign in as ${config.label}`}<span>→</span></button>
            </form>
            <div className="public-form-footer" style={{ marginTop: 18 }}><span style={{ color: "#667386", fontSize: 10 }}>Need another portal?</span><Link className="public-text-link" to="/login">Choose a role</Link></div>
            {role === "HOSPITAL" && <Link to="/hospital/register" className="public-btn public-btn-secondary" style={{ width: "100%", marginTop: 10 }}>Register a new hospital</Link>}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoleLogin;
