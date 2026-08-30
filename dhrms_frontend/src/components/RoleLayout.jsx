import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleNavigation = {
  HOSPITAL: [
    { to: "/hospital", label: "Dashboard", end: true },
    { to: "/hospital/doctors", label: "Doctors" },
    { to: "/hospital/workers", label: "Workers" },
    { to: "/hospital/workers/scan", label: "Scan Worker QR" },
    { to: "/hospital/find-worker", label: "Find Worker" },
  ],
  DOCTOR: [
    { to: "/doctor", label: "Dashboard", end: true },
    { to: "/doctor/workers", label: "My Workers" },
  ],
  WORKER: [
    { to: "/worker", label: "Dashboard", end: true },
    { to: "/worker/profile", label: "My Profile" },
    { to: "/worker/medical-history", label: "Medical History" },
  ],
};

const roleNames = {
  HOSPITAL: "Hospital staff",
  DOCTOR: "Doctor",
  WORKER: "Worker",
};

const RoleLayout = ({ title, description, actions, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(() => roleNavigation[user?.role] || [], [user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="sidebar-brand brand-button" onClick={() => navigate("/")} type="button">
          <span className="brand-mark">D</span>
          <span>
            <strong>DHRMS</strong>
            <small>Digital Health Records</small>
          </span>
        </button>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-dot" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{(user?.email || "U").charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-copy">
              <strong>{user?.email || "User"}</strong>
              <small>{roleNames[user?.role] || user?.role || "Account"}</small>
            </div>
          </div>
          <button className="button button-secondary sidebar-logout" onClick={handleLogout} type="button">
            Sign out
          </button>
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
                <button
                  key={action.label}
                  type="button"
                  className={action.variant === "secondary" ? "button button-secondary" : "button button-primary"}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="breadcrumbs">
          <button type="button" onClick={() => navigate("/")}>DHRMS</button>
          <span>/</span>
          <span>{location.pathname.split("/").filter(Boolean).pop() || "dashboard"}</span>
        </div>

        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default RoleLayout;
