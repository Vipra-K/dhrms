import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { getWorkers, terminateHospitalRelationship } from "../../services/workerService";

const ManageWorkers = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terminatingId, setTerminatingId] = useState(null);

  const loadWorkers = async () => {
    try {
      setError("");
      const data = await getWorkers();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err, "Unable to load workers associated with this hospital."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleTerminate = async (worker) => {
    const confirmed = window.confirm(
      `Terminate the hospital relationship with ${worker.fullName}? Their DHRMS account and medical history will remain available, but this hospital will no longer be able to start new visits for them.`
    );
    if (!confirmed) return;

    setTerminatingId(worker.id);
    setError("");
    try {
      await terminateHospitalRelationship(worker.id);
      setWorkers((current) => current.filter((item) => String(item.id) !== String(worker.id)));
    } catch (err) {
      setError(getApiError(err, "Unable to terminate the hospital relationship."));
    } finally {
      setTerminatingId(null);
    }
  };

  return (
    <RoleLayout
      title="Manage Workers"
      description="Workers currently associated with this hospital"
      actions={[{ label: "Find worker", onClick: () => navigate("/hospital/find-worker") }]}
    >
      {error && <div className="alert error">{error}</div>}
      <div className="panel">
        <div className="section-toolbar">
          <div>
            <span className="eyebrow">Hospital relationships</span>
            <h2>Active workers</h2>
            <p>These workers currently have an active relationship with this hospital. Ending a relationship does not deactivate the worker account or delete medical history.</p>
          </div>
          <button className="button button-secondary" type="button" onClick={() => { setLoading(true); loadWorkers(); }} disabled={loading}>Refresh</button>
        </div>

        {loading ? (
          <div className="loading-card">Loading workers…</div>
        ) : workers.length === 0 ? (
          <div className="empty-state-card">
            <h3>No active workers</h3>
            <p>No workers are currently associated with this hospital.</p>
            <button className="button button-primary" type="button" onClick={() => navigate("/hospital/find-worker")}>Find a worker</button>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Phone</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span>
                        <div><strong>{worker.fullName}</strong><small>{worker.workerCode}</small></div>
                      </div>
                    </td>
                    <td>{worker.phone || "—"}</td>
                    <td>{worker.assignedDoctor?.name || "No doctor assigned"}</td>
                    <td><span className="status-badge status-active">ACTIVE</span></td>
                    <td>
                      <div className="header-actions">
                        <button className="button button-secondary" type="button" onClick={() => navigate(`/hospital/workers/${worker.id}`)}>View</button>
                        <button className="button button-primary" type="button" onClick={() => handleTerminate(worker)} disabled={terminatingId === worker.id}>
                          {terminatingId === worker.id ? "Terminating…" : "Terminate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default ManageWorkers;
