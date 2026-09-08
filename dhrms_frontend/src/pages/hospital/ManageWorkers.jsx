import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { getWorkers, terminateHospitalRelationship } from "../../services/workerService";

const ManageWorkers = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terminatingId, setTerminatingId] = useState(null);

  const loadWorkers = async () => {
    setLoading(true);
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

  useEffect(() => { loadWorkers(); }, []);

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workers;
    return workers.filter((worker) => [worker.fullName, worker.phone, worker.workerCode].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [workers, search]);

  const handleTerminate = async (worker) => {
    const confirmed = window.confirm(`End the hospital relationship with ${worker.fullName}? Their DHRMS account and medical history will remain available, but this hospital will no longer be able to start new visits for them.`);
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
      title="Workers"
      description="Manage the workers currently associated with this hospital and move directly to their profile or doctor assignment."
      actions={[
        { label: "Find worker", onClick: () => navigate("/hospital/find-worker") },
        { label: "Assign doctor", onClick: () => navigate("/hospital/assign-doctor"), variant: "secondary" },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      <section className="panel">
        <div className="section-toolbar">
          <div><span className="eyebrow">Hospital directory</span><h2>{workers.length} worker{workers.length === 1 ? "" : "s"}</h2><p>Search by name, phone number, or DHRMS worker ID.</p></div>
          <button className="button button-secondary" type="button" onClick={loadWorkers} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
        </div>

        <div className="field" style={{ margin: "18px 0" }}>
          <label htmlFor="worker-directory-search">Search workers</label>
          <input id="worker-directory-search" className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, or worker ID" />
        </div>

        {loading ? (
          <div className="loading-card">Loading workers…</div>
        ) : workers.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">W</span><h3>No workers associated</h3><p>Find a worker to establish the hospital relationship and begin care.</p>
            <button className="button button-primary" type="button" onClick={() => navigate("/hospital/find-worker")}>Find a worker</button>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">⌕</span><h3>No matching workers</h3><p>Try a different name, phone number, or worker ID.</p>
            <button className="button button-secondary" type="button" onClick={() => setSearch("")}>Clear search</button>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Contact</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id}>
                    <td><div className="person-cell"><span className="avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span><div><strong>{worker.fullName || "Worker"}</strong><small>{worker.workerCode || "Worker record"}</small></div></div></td>
                    <td>{worker.phone || "—"}</td>
                    <td>{worker.assignedDoctor?.name || worker.assignedDoctor?.fullName || <span className="muted-note">Unassigned</span>}</td>
                    <td><span className="status-badge status-active">ACTIVE</span></td>
                    <td><div className="row-actions"><button className="button button-primary button-small" type="button" onClick={() => navigate(`/hospital/workers/${worker.id}`)}>Open</button><button className="button button-secondary button-small" type="button" onClick={() => navigate(`/hospital/assign-doctor?workerId=${encodeURIComponent(worker.id)}`)}>Assign</button><button className="button button-ghost button-small" type="button" onClick={() => handleTerminate(worker)} disabled={terminatingId === worker.id}>{terminatingId === worker.id ? "Ending…" : "End relationship"}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="dashboard-note"><strong>One worker, one hospital relationship.</strong><span>Ending the relationship removes this hospital's access to start new visits, while the worker's DHRMS identity and medical history remain available.</span></div>
    </RoleLayout>
  );
};

export default ManageWorkers;
