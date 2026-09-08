import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const dashboardPath = { HOSPITAL: "/hospital", DOCTOR: "/doctor", WORKER: "/worker", REGISTRATION_OFFICER: "/registration" }[user?.role];

  return (
    <div className="public-shell">
      <div className="public-container">
        <nav className="public-nav" aria-label="Primary navigation">
          <button className="public-brand" type="button" onClick={() => navigate("/")}>
            <span className="public-brand-mark">D</span>
            DHRMS
          </button>
          <div className="public-nav-links">
            <a href="#about">About</a><a href="#features">Capabilities</a><a href="#roles">Portals</a>
          </div>
          <div className="public-nav-actions">
            {isAuthenticated ? (
              <>
                <button className="public-btn public-btn-secondary" type="button" onClick={() => navigate(dashboardPath || "/login")}>My workspace</button>
                <button className="public-btn public-btn-primary" type="button" onClick={logout}>Sign out</button>
              </>
            ) : <button className="public-btn public-btn-primary" type="button" onClick={() => navigate("/login")}>Sign in</button>}
          </div>
        </nav>

        <main>
          <section className="public-hero" id="about">
            <div>
              <span className="public-kicker">Digital Health Record Management System</span>
              <h1>Worker healthcare, connected from registration to care.</h1>
              <p className="public-hero-copy">DHRMS brings worker identity, hospital operations and clinical records into one secure, role-based experience. Each user gets the tools they need without the clutter they don't.</p>
              <div className="public-actions">
                <button className="public-btn public-btn-primary" type="button" onClick={() => navigate("/login")}>Access DHRMS <span>→</span></button>
                <button className="public-btn public-btn-secondary" type="button" onClick={() => navigate("/hospital/register")}>Register a hospital</button>
              </div>
              <div className="public-trust"><span>Role-based access</span><span>QR worker identity</span><span>Centralized records</span></div>
            </div>

            <div className="public-console" aria-label="DHRMS preview">
              <div className="public-console-top"><span className="public-dots"><i/><i/><i/></span><span>secure.dhrms / workspace</span></div>
              <div className="public-console-body">
                <div className="public-metric-grid">
                  <div className="public-metric"><small>Worker identity</small><strong>Verified</strong><span>QR-linked record</span></div>
                  <div className="public-metric"><small>Access model</small><strong>Role-based</strong><span>Relevant data only</span></div>
                </div>
                <div className="public-record"><span className="public-record-avatar">W</span><div className="public-record-copy"><small>Worker health profile</small><strong>Secure medical history</strong></div><span className="public-status">Active</span></div>
                <div className="public-lines"><i/><i/><i/></div>
              </div>
            </div>
          </section>

          <section className="public-section" id="features">
            <div className="public-section-head"><span>Built around the workflow</span><h2>Everything starts with a trusted worker identity.</h2><p>From registration and identification to hospital assignment and clinical care, the experience stays focused on the actual workflow.</p></div>
            <div className="public-feature-grid">
              <article className="public-feature"><span className="public-feature-number">01 / IDENTIFY</span><h3>Register & identify</h3><p>Create worker profiles and issue a persistent DHRMS identity for reliable lookup across the system.</p></article>
              <article className="public-feature"><span className="public-feature-number">02 / OPERATE</span><h3>Coordinate care</h3><p>Hospitals can manage workers and doctors, connect assignments and start healthcare workflows from dedicated screens.</p></article>
              <article className="public-feature"><span className="public-feature-number">03 / RECORD</span><h3>Maintain care history</h3><p>Doctors work with assigned workers and maintain the clinical information that belongs in the health record.</p></article>
            </div>
          </section>

          <section className="public-section" id="roles">
            <div className="public-section-head"><span>Purpose-built portals</span><h2>One platform. Four focused roles.</h2><p>Choose the portal that matches your responsibility. DHRMS keeps each workspace focused on the tasks and records that role is responsible for.</p></div>
            <div className="public-role-list">
              <article className="public-role"><span className="public-role-icon">R</span><div><h3>Registration Officer</h3><p>Register workers, verify identity and issue DHRMS identities.</p></div><button type="button" onClick={() => navigate("/login/registration-officer")}>Open portal →</button></article>
              <article className="public-role"><span className="public-role-icon">H</span><div><h3>Hospital</h3><p>Manage doctors, workers and healthcare visits from an operational workspace.</p></div><button type="button" onClick={() => navigate("/login/hospital")}>Open portal →</button></article>
              <article className="public-role"><span className="public-role-icon">D</span><div><h3>Doctor</h3><p>Handle assigned workers, encounters, medical records and prescriptions.</p></div><button type="button" onClick={() => navigate("/login/doctor")}>Open portal →</button></article>
              <article className="public-role"><span className="public-role-icon">W</span><div><h3>Worker</h3><p>Access your personal profile, QR identity and health records.</p></div><button type="button" onClick={() => navigate("/login/worker")}>Open portal →</button></article>
            </div>
          </section>

          <section className="public-cta"><div><span className="public-kicker">Ready to begin</span><h2>Enter the DHRMS portal for your role.</h2></div><button className="public-btn public-btn-primary" type="button" onClick={() => navigate("/login")}>Choose your portal →</button></section>
        </main>

        <footer className="public-footer"><strong>DHRMS</strong><span>Digital Health Record Management System</span><span>Secure • Role-based • Worker-focused</span></footer>
      </div>
    </div>
  );
};

export default Home;
