import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleNavigation = {
  HOSPITAL: [
    { to: "/hospital", label: "Dashboard" },
    { to: "/hospital/doctors", label: "Doctors" },
    { to: "/hospital/workers", label: "Workers" },
    { to: "/hospital/workers/scan", label: "QR Scanner" },
    { to: "/hospital/find-worker", label: "Find Worker" },
  ],
  DOCTOR: [
    { to: "/doctor", label: "Dashboard" },
    { to: "/doctor/workers", label: "My Workers" },
  ],
  WORKER: [
    { to: "/worker", label: "Dashboard" },
    { to: "/worker/profile", label: "My Profile" },
    { to: "/worker/medical-history", label: "Medical History" },
  ],
};

const RoleLayout = ({ title, description, actions, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = useMemo(
    () => roleNavigation[user?.role] || [],
    [user?.role],
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">D</span>
          <div>
            <p>DH</p>
            <small>Resource Manager</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span>{user?.email || "User"}</span>
            <small>{user?.role || "Role"}</small>
          </div>
          <button className="button button-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content-area">
        <header className="page-header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </div>
          {actions?.length > 0 && (
            <div className="header-actions">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={
                    action.variant === "secondary"
                      ? "button button-secondary"
                      : "button button-primary"
                  }
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </header>

        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default RoleLayout;
RoleLayout;
