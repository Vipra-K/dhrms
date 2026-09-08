import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerHospital } from "../services/authService";

const ArrowIcon = ({ direction = "right" }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">
    {direction === "left" ? (
      <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" />
    ) : (
      <path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" />
    )}
  </svg>
);

const RegisterIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">
    <path d="M10 4v12M4 10h12" />
  </svg>
);

const HospitalRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ hospitalName: "", hfrId: "", hospitalCode: "", email: "", password: "", address: "", city: "", district: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await registerHospital(form);
      setSuccess(response.message || "Hospital account created successfully.");
      setTimeout(() => navigate("/login/hospital"), 1400);
    } catch (err) {
      setError(err.response?.data?.error || "We couldn't create the hospital account. Please review the details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-auth-shell public-register-shell">
      <div className="public-auth-wrap public-register-wrap">
        <main className="public-auth-card public-register-card">
          <div className="public-register-topbar">
            <button className="public-icon-btn public-register-back" type="button" onClick={() => navigate("/login")} title="Back to portal selection" aria-label="Back to portal selection">
              <ArrowIcon direction="left" />
            </button>
          </div>

          <header className="public-register-head">
            <div className="public-register-icon"><RegisterIcon /></div>
            <span className="public-kicker">Hospital registration</span>
            <h1>Register your hospital</h1>
            <p>Set up your hospital account to manage authorised workers, doctors and healthcare workflows.</p>
          </header>

          {error && <div className="public-alert public-alert-error" role="alert">{error}</div>}
          {success && <div className="public-alert public-alert-success" role="status">{success}</div>}

          <form onSubmit={handleSubmit} className="public-form public-register-form">
            <div className="public-register-grid">
              <div className="public-field"><label htmlFor="hospitalName">Hospital name</label><input id="hospitalName" className="public-input" name="hospitalName" value={form.hospitalName} onChange={handleChange} required placeholder="Enter hospital name" /></div>
              <div className="public-field"><label htmlFor="hfrId">HFR ID</label><input id="hfrId" className="public-input" name="hfrId" value={form.hfrId} onChange={handleChange} placeholder="HFR-KL-0001" required /></div>
              <div className="public-field"><label htmlFor="hospitalCode">Hospital code</label><input id="hospitalCode" className="public-input" name="hospitalCode" value={form.hospitalCode} onChange={handleChange} required placeholder="Enter hospital code" /></div>
              <div className="public-field"><label htmlFor="email">Email address</label><input id="email" className="public-input" type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="hospital@example.com" /></div>
              <div className="public-field"><label htmlFor="password">Password</label><input id="password" className="public-input" type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="new-password" placeholder="Create a password" /></div>
              <div className="public-field"><label htmlFor="phone">Phone</label><input id="phone" className="public-input" name="phone" value={form.phone} onChange={handleChange} placeholder="Hospital phone number" /></div>
              <div className="public-field public-register-wide"><label htmlFor="address">Address</label><input id="address" className="public-input" name="address" value={form.address} onChange={handleChange} placeholder="Street address" /></div>
              <div className="public-field"><label htmlFor="city">City</label><input id="city" className="public-input" name="city" value={form.city} onChange={handleChange} placeholder="City" /></div>
              <div className="public-field"><label htmlFor="district">District</label><input id="district" className="public-input" name="district" value={form.district} onChange={handleChange} placeholder="District" /></div>
            </div>

            <button type="submit" className="public-btn public-btn-primary public-submit" disabled={loading}>
              <span>{loading ? "Creating account…" : "Create hospital account"}</span>
              {loading ? null : <RegisterIcon />}
            </button>
          </form>

          <div className="public-form-footer public-register-footer">
            <span>Already have a hospital account?</span>
            <Link className="public-text-link public-register-login-link" to="/login/hospital">Login <ArrowIcon /></Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HospitalRegister;
