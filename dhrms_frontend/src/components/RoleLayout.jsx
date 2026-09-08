import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleNavigation = {
  REGISTRATION_OFFICER: [
    { to: "/registration", label: "Dashboard", end: true },
    { to: "/registration/register", label: "Register Worker" },
    { to: "/registration/workers", label: "Workers" },
  ],
  HOSPITAL: [
    { to: "/hospital", label: "Dashboard", end: true },
    { to: "/hospital/manage-workers", label: "Workers" },
    { to: "/hospital/assign-doctor", label: "Assign Doctor" },
    { to: "/hospital/doctors", label: "Doctors" },
    { to: "/hospital/workers/scan", label: "Start Visit" },
    { to: "/hospital/workers", label: "Active Visits" },
  ],
  DOCTOR: [
    { to: "/doctor", label: "Dashboard", end: true },
    { to: "/doctor/workers", label: "Active Visits" },
  ],
  WORKER: [
    { to: "/worker", label: "Overview", end: true },
    { to: "/worker/qr", label: "My QR" },
    { to: "/worker/medical-history", label: "Medical history" },
    { to: "/worker/prescriptions", label: "Prescriptions" },
    { to: "/worker/documents", label: "Documents" },
    { to: "/worker/profile", label: "Profile" },
  ],
};

const roleNames = {
  REGISTRATION_OFFICER: "Registration officer",
  HOSPITAL: "Hospital staff",
  DOCTOR: "Doctor",
  WORKER: "Worker",
};

const RoleLayout = ({ title, description, actions, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = useMemo(() => roleNavigation[user?.role] || [], [user?.role]);
  const isWorker = user?.role === "WORKER";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`app-shell ${isWorker ? "role-worker" : ""}`}>
      <aside className="sidebar" aria-label={`${roleNames[user?.role] || "DHRMS"} navigation`}>
        <button className="sidebar-brand brand-button" onClick={() => navigate("/")} type="button">
          <span className="brand-mark">D</span>
          <span><strong>DHRMS</strong><small>Digital Health Records</small></span>
        </button>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <span className="nav-dot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">{(user?.email || "U").charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-copy"><strong>{user?.email || "User"}</strong><small>{roleNames[user?.role] || user?.role || "Account"}</small></div>
          </div>
          <button className="button button-secondary sidebar-logout" onClick={handleLogout} type="button">Sign out</button>
        </div>
      </aside>
      <main className="content-area">
        <header className="page-header">
          <div>
            <p className="eyebrow">{roleNames[user?.role] || "DHRMS"}</p>
            <h1>{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </div>
          {actions?.length > 0 && (
            <div className="header-actions">
              {actions.map((action) => (
                <button key={action.label} type="button" disabled={action.disabled} aria-label={action.label} title={action.label} className={action.variant === "secondary" ? "button button-secondary" : "button button-primary"} onClick={action.onClick}>
                  {action.icon ? <span aria-hidden="true">{action.icon}</span> : null}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </header>
        <div className="breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate("/")}>DHRMS</button>
          <span aria-hidden="true">/</span>
          <span>{location.pathname.split("/").filter(Boolean).pop() || "dashboard"}</span>
        </div>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default RoleLayout;
