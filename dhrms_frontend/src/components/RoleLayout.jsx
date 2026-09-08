import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../registration-dark.css";

const Icon = ({ name }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    pulse: <><path d="M3 12h4l2-7 4 14 2-7h6"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 3.2a4 4 0 0 1 0 7.6"/><path d="M21 21v-2a4 4 0 0 0-2.5-3.7"/></>,
    doctor: <><circle cx="12" cy="7" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M19 5v4m-2-2h4"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.4l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.4l-2 2a5 5 0 0 0 7.1 7.1l1.2-1.2"/></>,
    scan: <><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M8 12h8M12 8v8"/></>,
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></>,
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>;
};

const roleNavigation = {
  REGISTRATION_OFFICER: [
    { to: "/registration", label: "Dashboard", icon: "grid", end: true },
    { to: "/registration/register", label: "Register Worker", icon: "users" },
    { to: "/registration/workers", label: "Workers", icon: "users" },
  ],
  HOSPITAL: [
    { group: "Operations" },
    { to: "/hospital", label: "Overview", icon: "grid", end: true },
    { to: "/hospital/workers/scan", label: "Start visit", icon: "scan" },
    { to: "/hospital/workers", label: "Active visits", icon: "pulse" },
    { group: "People" },
    { to: "/hospital/manage-workers", label: "Workers", icon: "users" },
    { to: "/hospital/doctors", label: "Doctors", icon: "doctor" },
    { to: "/hospital/assign-doctor", label: "Assign doctor", icon: "link" },
  ],
  DOCTOR: [
    { to: "/doctor", label: "Dashboard", icon: "grid", end: true },
    { to: "/doctor/workers", label: "Active Visits", icon: "pulse" },
  ],
  WORKER: [
    { to: "/worker", label: "Overview", icon: "grid", end: true },
    { to: "/worker/qr", label: "My QR", icon: "scan" },
    { to: "/worker/medical-history", label: "Medical history", icon: "pulse" },
    { to: "/worker/prescriptions", label: "Prescriptions", icon: "doctor" },
    { to: "/worker/documents", label: "Documents", icon: "grid" },
    { to: "/worker/profile", label: "Profile", icon: "users" },
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
  const isHospital = user?.role === "HOSPITAL";
  const isRegistrationOfficer = user?.role === "REGISTRATION_OFFICER";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const currentSection = navItems.find((item) => item.to && (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))?.label;

  return (
    <div className={`app-shell ${isWorker ? "role-worker" : ""} ${isHospital ? "role-hospital" : ""} ${isRegistrationOfficer ? "role-registration" : ""}`}>
      <aside className="sidebar" aria-label={`${roleNames[user?.role] || "DHRMS"} navigation`}>
        <button className="sidebar-brand brand-button" onClick={() => navigate("/")} type="button">
          <span className="brand-mark"><span>D</span></span>
          <span><strong>DHRMS</strong><small>Digital Health Records</small></span>
        </button>

        <div className="sidebar-workspace">
          <span className="sidebar-section-label">{isHospital ? "Hospital workspace" : "Workspace"}</span>
          <nav className="sidebar-nav" aria-label="Primary navigation">
            {navItems.map((item, index) => item.group ? (
              <div className="sidebar-group-label" key={`${item.group}-${index}`}>{item.group}</div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          {isHospital && <button className="sidebar-quick-action" type="button" onClick={() => navigate("/hospital/workers/scan")}><span className="quick-action-icon"><Icon name="scan" /></span><span><strong>Start a visit</strong><small>Scan or identify a worker</small></span><span className="quick-action-arrow">→</span></button>}
          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">{(user?.email || "U").charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-copy"><strong>{user?.email || "User"}</strong><small>{roleNames[user?.role] || user?.role || "Account"}</small></div>
          </div>
          <button className="button button-secondary sidebar-logout" onClick={handleLogout} type="button">Sign out</button>
        </div>
      </aside>

      <main className="content-area">
        <header className="page-header">
          <div className="page-title-stack">
            <div className="page-context"><span>{roleNames[user?.role] || "DHRMS"}</span>{currentSection && <><span className="context-separator">/</span><span>{currentSection}</span></>}</div>
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
        <div className="breadcrumbs" aria-label="Breadcrumb"><button type="button" onClick={() => navigate("/")}>Home</button><span aria-hidden="true">/</span><span>{location.pathname.split("/").filter(Boolean).pop()?.replaceAll("-", " ") || "dashboard"}</span></div>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default RoleLayout;
