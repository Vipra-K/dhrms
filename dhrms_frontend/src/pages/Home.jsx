import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardPath = {
    HOSPITAL: "/hospital",
    DOCTOR: "/doctor",
    WORKER: "/worker",
  }[user?.role];

  return (
    <div className="auth-page home-page-wrapper">
      <main className="home-panel">
        <div className="hero-panel">
          <div>
            <p className="eyebrow">Digital Health Record Management System</p>
            <h1>Migration Worker Care, unified in one secure dashboard.</h1>
            <p className="page-description">
              Monitor worker health records, manage hospital and doctor access,
              and keep medical history available wherever the migration journey
              takes them.
            </p>
          </div>

          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => navigate(dashboardPath)}
                >
                  Go to dashboard
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={logout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => navigate("/hospital/register")}
                >
                  Register Hospital
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card-grid">
          <article className="card">
            <h3>Secure access</h3>
            <p>
              Role-based login for hospitals, doctors, and workers with
              protected routes.
            </p>
          </article>
          <article className="card">
            <h3>Record management</h3>
            <p>
              Store medical histories, doctor assignments, and worker profiles
              centrally.
            </p>
          </article>
          <article className="card">
            <h3>Migration-first</h3>
            <p>
              Designed for migration workers with mobile-friendly record lookup
              and QR scanning.
            </p>
          </article>
        </div>
      </main>
    </div>
  );
};

export default Home;
