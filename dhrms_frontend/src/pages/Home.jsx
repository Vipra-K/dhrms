import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ArrowIcon = ({ direction = "right" }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">
    {direction === "left" ? <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16" /> : <path d="M7.5 4.5 13 10l-5.5 5.5M4 10h9" />}
  </svg>
);

const roles = [
  { label: "Registration Officer", code: "R", description: "Register workers, verify identity and maintain DHRMS records.", path: "/login/registration-officer" },
  { label: "Hospital", code: "H", description: "Manage workers, doctors and healthcare workflows.", path: "/login/hospital" },
  { label: "Doctor", code: "D", description: "Manage assigned workers and maintain clinical records.", path: "/login/doctor" },
  { label: "Worker", code: "W", description: "Access your profile, QR identity and health records.", path: "/login/worker" },
];

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
            <a href="#about">Overview</a><a href="#features">Capabilities</a><a href="#roles">Portals</a>
          </div>
          <div className="public-nav-actions">
            {isAuthenticated ? (
              <>
                <button className="public-btn public-btn-secondary" type="button" onClick={() => navigate(dashboardPath || "/login")}>My workspace <ArrowIcon /></button>
                <button className="public-btn public-btn-primary" type="button" onClick={logout}>Sign out</button>
              </>
            ) : <button className="public-btn public-btn-primary" type="button" onClick={() => navigate("/login")}>Sign in <ArrowIcon /></button>}
          </div>
        </nav>

        <main>
          <section className="public-hero" id="about">
            <div>
              <span className="public-kicker">Digital Health Record Management System</span>
              <h1>A secure digital health record platform for workers.</h1>
              <p className="public-hero-copy">DHRMS connects worker identity, hospital services and clinical records in one secure, role-based system. Each role gets focused access to the information and workflows it needs.</p>
              <div className="public-actions">
                <button className="public-btn public-btn-primary" type="button" onClick={() => navigate("/login")}>Access DHRMS <ArrowIcon /></button>
                <button className="public-btn public-btn-secondary" type="button" onClick={() => navigate("/hospital/register")}>Register a hospital <span className="public-add-icon">+</span></button>
              </div>
              <div className="public-trust"><span>Role-based access</span><span>QR-enabled identity</span><span>Centralized health records</span></div>
            </div>

            <div className="public-console" aria-label="DHRMS platform overview">
              <div className="public-console-top"><span className="public-dots"><i/><i/><i/></span><span>DHRMS / secure workspace</span></div>
              <div className="public-console-body">
                <div className="public-metric-grid">
                  <div className="public-metric"><small>Worker identity</small><strong>Verified</strong><span>QR-linked profile</span></div>
                  <div className="public-metric"><small>Access control</small><strong>Role-based</strong><span>Relevant data only</span></div>
                </div>
                <div className="public-record"><span className="public-record-avatar">W</span><div className="public-record-copy"><small>Worker health record</small><strong>Centralized clinical history</strong></div><span className="public-status">Active</span></div>
                <div className="public-lines"><i/><i/><i/></div>
              </div>
            </div>
          </section>

          <section className="public-section" id="features">
            <div className="public-section-head"><span>Core capabilities</span><h2>One workflow from identity to care.</h2><p>DHRMS brings the operational and clinical steps together so authorized users can find the right worker, manage relationships and maintain the health record.</p></div>
            <div className="public-feature-grid">
              <article className="public-feature"><span className="public-feature-number">01 / IDENTITY</span><h3>Register and identify</h3><p>Create worker profiles and issue a persistent DHRMS identity for reliable identification and lookup.</p></article>
              <article className="public-feature"><span className="public-feature-number">02 / OPERATIONS</span><h3>Coordinate healthcare</h3><p>Hospitals manage workers and doctors, establish assignments and initiate healthcare workflows from one workspace.</p></article>
              <article className="public-feature"><span className="public-feature-number">03 / CLINICAL RECORD</span><h3>Maintain health records</h3><p>Authorized doctors can work with assigned workers and maintain the clinical information associated with their care.</p></article>
            </div>
          </section>

          <section className="public-section" id="roles">
            <div className="public-section-head"><span>Role-based access</span><h2>A focused workspace for every role.</h2><p>DHRMS separates responsibilities across four portals so users can work with the records and workflows relevant to their role.</p></div>
            <div className="public-role-list">
              {roles.map((role) => (
                <article className="public-role" key={role.label}>
                  <span className="public-role-icon">{role.code}</span>
                  <div><h3>{role.label}</h3><p>{role.description}</p></div>
                  <button className="public-icon-btn" type="button" title={`Open ${role.label} portal`} aria-label={`Open ${role.label} portal`} onClick={() => navigate(role.path)}><ArrowIcon /></button>
                </article>
              ))}
            </div>
          </section>

          <section className="public-cta"><div><span className="public-kicker">DHRMS access</span><h2>Choose the portal for your role.</h2></div><button className="public-btn public-btn-primary" type="button" onClick={() => navigate("/login")}>Choose your portal <ArrowIcon /></button></section>
        </main>

        <footer className="public-footer"><strong>DHRMS</strong><span>Digital Health Record Management System</span><span>Secure • Role-based • Worker-focused</span></footer>
      </div>
    </div>
  );
};

export default Home;
