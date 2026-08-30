import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(form.email, form.password);
      loginUser(response);

      if (response.role === "HOSPITAL") {
        navigate("/hospital");
      } else if (response.role === "DOCTOR") {
        navigate("/doctor");
      } else if (response.role === "WORKER") {
        navigate("/worker");
      } else {
        setError("Unsupported user role");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <div className="result-panel">
          <p className="eyebrow">DHRMS Access</p>
          <h1>Sign in to your account</h1>
          <p>
            Secure access for hospitals, doctors, and workers with role-based
            dashboards.
          </p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <span>New to DHRMS?</span>
          <Link to="/hospital/register" className="button button-secondary">
            Register Hospital
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Login;
