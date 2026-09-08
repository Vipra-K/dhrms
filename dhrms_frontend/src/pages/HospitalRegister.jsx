import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerHospital } from "../services/authService";

const ArrowIcon = ({ direction = "right" }) => <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">{direction === "left" ? <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" /> : <path d="M7.5 4.5 13 10l-5.5 5.5M4 10h9" />}</svg>;
const RegisterIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon"><path d="M10 4v12M4 10h12" /></svg>;
const LoginIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon"><path d="M11 4h5v12h-5M10 10H4m0 0 3-3M4 10l3 3" /></svg>;

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
      setSuccess(response.message || "Hospital registered successfully.");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setError(err.response?.data?.error || "Hospital registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-auth-shell">
      <div className="public-auth-wrap public-register-wrap">
        <main className="public-auth-card public-register-card">
          <div className="public-register-topbar">
            <button className="public-brand" type="button" onClick={() => navigate("/")}><span className="public-brand-mark">D</span>DHRMS</button>
            <button className="public-icon-btn" type="button" onClick={() => navigate("/login")} title="Back to portal selection" aria-label="Back to portal selection"><ArrowIcon direction="left" /></button>
          </div>

          <header className="public-register-head">
            <div className="public-register-icon"><span>+</span></div>
            <span className="public-kicker">Hospital registration</span>
            <h1>Create a hospital account</h1>
            <p>Set up your hospital profile and start managing doctors, workers, and healthcare visits.</p>
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

            <button type="submit" className="public-btn public-btn-primary public-submit" disabled={loading}><span>{loading ? "Registering hospital…" : "Register hospital"}</span>{loading ? null : <RegisterIcon />}</button>
          </form>

          <div className="public-form-footer public-register-footer"><span>Already registered?</span><Link className="public-icon-link" to="/login" title="Sign in" aria-label="Sign in"><LoginIcon /></Link></div>
        </main>
      </div>
    </div>
  );
};

export default HospitalRegister;
