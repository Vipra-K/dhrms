import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerHospital } from "../services/authService";

const HospitalRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hospitalName: "",
    hfrId: "",
    hospitalCode: "",
    email: "",
    password: "",
    address: "",
    city: "",
    district: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setLoading(true);

    try {
      const response = await registerHospital(form);
      setSuccess(response.message || "Hospital registered successfully.");
      setTimeout(() => {
        navigate("/login");
      }, 1400);
    } catch (error) {
      setError(error.response?.data?.error || "Hospital registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-panel register-panel">
        <div className="result-panel">
          <p className="eyebrow">Hospital Registration</p>
          <h1>Create a hospital account</h1>
          <p>Set up your hospital profile and manage doctors, workers, and patient records.</p>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="hospitalName">Hospital Name</label>
              <input
                id="hospitalName"
                className="input"
                name="hospitalName"
                value={form.hospitalName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="hfrId">HFR ID</label>
              <input
                id="hfrId"
                className="input"
                name="hfrId"
                value={form.hfrId}
                onChange={handleChange}
                placeholder="HFR-KL-0001"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="hospitalCode">Hospital Code</label>
              <input
                id="hospitalCode"
                className="input"
                name="hospitalCode"
                value={form.hospitalCode}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="field">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                className="input"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                className="input"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="district">District</label>
              <input
                id="district"
                className="input"
                name="district"
                value={form.district}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                className="input"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "Registering..." : "Register Hospital"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered?</span>
          <Link to="/login" className="button button-secondary">
            Login
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HospitalRegister;
