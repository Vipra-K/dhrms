import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const dashboardPath = { HOSPITAL: "/hospital", DOCTOR: "/doctor", WORKER: "/worker" }[user?.role];

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <button type="button" className="landing-brand" onClick={() => navigate("/")}>DHRMS</button>
        <div className="landing-nav-links"><a href="#about">About</a><a href="#features">Features</a><a href="#roles">For users</a></div>
        <div className="landing-actions">
          {isAuthenticated ? <><button className="button button-secondary" onClick={() => navigate(dashboardPath)}>Dashboard</button><button className="button button-primary" onClick={logout}>Sign out</button></> : <button className="button button-primary" onClick={() => navigate("/login")}>Sign in</button>}
        </div>
      </nav>

      <main>
        <section className="landing-hero" id="about">
          <div className="landing-hero-copy">
            <span className="landing-pill">Digital Health Record Management System</span>
            <h1>One clear health record for every worker.</h1>
            <p>DHRMS helps hospitals, doctors and workers manage health information in one secure, role-based system — from registration and identification to medical records and prescriptions.</p>
            <div className="landing-hero-actions"><button className="button button-primary button-large" onClick={() => navigate("/login")}>Access DHRMS</button><button className="button button-secondary button-large" onClick={() => navigate("/hospital/register")}>Register a hospital</button></div>
            <div className="landing-trust-row"><span>Role-based access</span><span>QR worker identity</span><span>Centralized records</span></div>
          </div>
          <div className="landing-hero-visual"><div className="hero-window"><div className="window-top"><span /><span /><span /></div><div className="hero-stat-grid"><div className="hero-stat"><small>Worker records</small><strong>Centralized</strong><span>Easy to find</span></div><div className="hero-stat"><small>Access</small><strong>Role-based</strong><span>Controlled visibility</span></div></div><div className="hero-record-card"><span className="record-avatar">W</span><div><small>Worker health profile</small><strong>Secure medical history</strong></div><span className="status-badge status-active">Active</span></div><div className="hero-line"><span /><span /><span /></div></div></div>
        </section>

        <section className="landing-section" id="features"><div className="section-heading"><span className="eyebrow">Built around the workflow</span><h2>Everything starts with the worker.</h2><p>Simple screens for each role, with the right information at the right time.</p></div><div className="feature-grid"><article className="feature-card"><span className="feature-number">01</span><h3>Register & identify</h3><p>Create worker profiles and give each worker a persistent QR identity for fast lookup.</p></article><article className="feature-card"><span className="feature-number">02</span><h3>Manage care</h3><p>Doctors can access assigned workers and maintain medical records and prescriptions.</p></article><article className="feature-card"><span className="feature-number">03</span><h3>Keep it organized</h3><p>Hospitals manage doctors and workers from dedicated operational screens instead of one crowded dashboard.</p></article></div></section>

        <section className="landing-section landing-role-section" id="roles"><div className="section-heading"><span className="eyebrow">Designed for every role</span><h2>One system. Three focused experiences.</h2></div><div className="role-card-grid"><article className="role-card"><span className="role-icon">H</span><div><h3>Hospitals</h3><p>Register workers, manage doctors, find workers and scan worker QR IDs.</p></div><button onClick={() => navigate("/hospital/register")}>Hospital access →</button></article><article className="role-card"><span className="role-icon">D</span><div><h3>Doctors</h3><p>Work with assigned workers and manage clinical records and prescriptions.</p></div><button onClick={() => navigate("/login/doctor")}>Doctor access →</button></article><article className="role-card"><span className="role-icon">W</span><div><h3>Workers</h3><p>View your profile and medical history through a simple personal dashboard.</p></div><button onClick={() => navigate("/login/worker")}>Worker access →</button></article></div></section>

        <section className="landing-cta"><div><span className="eyebrow">Ready when you are</span><h2>Bring worker health management into one place.</h2></div><button className="button button-primary button-large" onClick={() => navigate("/login")}>Open DHRMS</button></section>
      </main>
      <footer className="landing-footer"><strong>DHRMS</strong><span>Digital Health Record Management System</span></footer>
    </div>
  );
};

export default Home;
