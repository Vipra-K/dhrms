import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerHospital } from "../services/authService";

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
      <div className="public-auth-wrap" style={{ maxWidth: 900 }}>
        <main className="public-auth-card" style={{ padding: 34 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <button className="public-brand" type="button" onClick={() => navigate("/")}><span className="public-brand-mark">D</span>DHRMS</button>
            <button className="public-back" type="button" onClick={() => navigate("/login")} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #202a38", background: "#111722", color: "#9ca7b8", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>← Back to portal</button>
          </div>

          <header className="public-form-head" style={{ textAlign: "center", maxWidth: 650, margin: "0 auto 28px" }}>
            <span className="public-kicker">Hospital registration</span>
            <h1>Create a hospital account</h1>
            <p>Set up your hospital profile to manage doctors, workers, and healthcare visits.</p>
          </header>

          {error && <div className="public-alert public-alert-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
          {success && <div className="public-alert public-alert-success" role="status" style={{ marginBottom: 16 }}>{success}</div>}

          <form onSubmit={handleSubmit} className="public-form">
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

            <button type="submit" className="public-btn public-btn-primary" style={{ width: "100%", marginTop: 8 }} disabled={loading}>{loading ? "Registering hospital…" : "Register hospital"}<span>→</span></button>
          </form>

          <div className="public-form-footer" style={{ marginTop: 18, justifyContent: "center" }}><span>Already registered?</span><Link className="public-text-link" to="/login">Sign in instead</Link></div>
        </main>
      </div>
    </div>
  );
};

export default HospitalRegister;
