import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkers } from "../../services/doctorService";
import { getApiError } from "../../services/api";
import "./doctor-pages.css";

const MyWorkers = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkers = async () => {
    try {
      setError("");
      setLoading(true);
      setWorkers(await getMyWorkers());
    } catch (err) {
      setError(getApiError(err, "Unable to load workers."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkers(); }, []);

  return (
    <RoleLayout
      title="My workers"
      actions={[{ label: "Refresh", onClick: loadWorkers, variant: "secondary", disabled: loading }]}
    >
      <div className="doctor-page">
        {error && <div className="alert error" role="alert">{error}</div>}

        <section className="page-card panel">
          <div className="toolbar">
            <div>
              <h2>Assigned workers</h2>
              {!loading && <span className="muted">{workers.length} worker{workers.length === 1 ? "" : "s"}</span>}
            </div>
          </div>

          {loading ? (
            <div className="loading-card">Loading workers…</div>
          ) : workers.length === 0 ? (
            <div className="empty-state-card">
              <h3>No workers assigned</h3>
            </div>
          ) : (
            <div className="worker-grid" style={{ marginTop: 18 }}>
              {workers.map((worker) => (
                <article className="worker-card" key={worker.workerId}>
                  <div className="worker-card-head">
                    <span className="worker-avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span>
                    <div>
                      <div className="worker-name">{worker.fullName || "Unknown worker"}</div>
                      <div className="worker-code">{worker.workerCode || "—"}</div>
                    </div>
                  </div>

                  <div className="worker-details">
                    <div className="worker-detail"><small>Gender</small><strong>{worker.gender || "—"}</strong></div>
                    <div className="worker-detail"><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></div>
                    <div className="worker-detail"><small>Phone</small><strong>{worker.phone || "—"}</strong></div>
                  </div>

                  <div className="worker-card-footer">
                    <button className="button button-primary button-small" type="button" onClick={() => navigate(`/doctor/workers/${worker.workerId}`)}>
                      View
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleLayout>
  );
};

export default MyWorkers;
