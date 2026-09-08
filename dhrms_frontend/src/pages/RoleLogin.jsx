import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";

const roleConfig = {
  REGISTRATION_OFFICER: { label: "Registration Officer", description: "Verify workers and issue permanent DHRMS identities.", redirect: "/registration" },
  HOSPITAL: { label: "Hospital", description: "Manage doctors and conduct worker healthcare visits.", redirect: "/hospital" },
  DOCTOR: { label: "Doctor", description: "Handle active visits and manage clinical records.", redirect: "/doctor" },
  WORKER: { label: "Worker", description: "View your profile and personal medical history.", redirect: "/worker" },
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
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await login(form.email, form.password);
      if (response.role !== role) { setError(`This is not a ${config.label.toLowerCase()} account.`); return; }
      loginUser(response); navigate(config.redirect, { replace: true });
    } catch (err) { setError(getApiError(err, "Invalid email or password.")); }
    finally { setLoading(false); }
  };

  return <div className="auth-page auth-split"><section className="auth-brand-panel"><button className="auth-brand" onClick={() => navigate("/")} type="button">DHRMS</button><span className="landing-pill">{config.label} portal</span><h1>Healthcare records, without the clutter.</h1><p>{config.description}</p><div className="auth-feature-list"><span>✓ Secure role-based access</span><span>✓ Simple, focused workspace</span><span>✓ Fast access to relevant records</span></div></section><main className="auth-panel role-auth-panel"><div className="auth-panel-heading"><span className="eyebrow">{config.label} access</span><h2>Welcome back</h2><p>Sign in to continue to your DHRMS workspace.</p></div>{error && <div className="alert error" role="alert">{error}</div>}<form onSubmit={handleSubmit} className="auth-form"><div className="field"><label htmlFor="email">Email</label><input id="email" className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" /></div><button type="submit" className="button button-primary button-full" disabled={loading}>{loading ? "Signing in…" : `Sign in as ${config.label}`}</button></form><div className="auth-switch"><span>Need another portal?</span><Link to="/login">Choose a role</Link></div>{role === "HOSPITAL" && <Link to="/hospital/register" className="button button-secondary button-full">Register hospital</Link>}</main></div>;
};

export default RoleLogin;
