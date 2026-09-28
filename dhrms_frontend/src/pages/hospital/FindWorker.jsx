import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { lookupWorkerByPhone, addWorkerToHospital } from "../../services/workerService";
import { getApiError } from "../../services/api";

const relationshipCopy = {
  ACTIVE: { label: "Active", tone: "status-active" },
  AVAILABLE: { label: "Ready to add", tone: "status-inactive" },
  OTHER_HOSPITAL: { label: "Another hospital", tone: "status-suspended" },
};

const FindWorker = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWorker(null);
    const phone = value.trim().replace(/[\s-]/g, "");
    if (!phone) {
      setError("Enter a phone number.");
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      setError("Enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const result = await lookupWorkerByPhone(phone);
      setWorker(result);
    } catch (err) {
      setError(getApiError(err, "No worker found."));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!worker) return;
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      await addWorkerToHospital(worker.id);
      setWorker((c) => (c ? { ...c, hospitalRelationshipStatus: "ACTIVE" } : c));
      setSuccess("Worker added to hospital.");
    } catch (err) {
      setError(getApiError(err, "Unable to add worker."));
    } finally {
      setAdding(false);
    }
  };

  const relationship = worker?.hospitalRelationshipStatus;
  const meta = relationshipCopy[relationship] || {
    label: relationship || "Unavailable",
    tone: "status-inactive",
  };

  return (
    <RoleLayout
      title="Find worker"
      description="Find a worker by registered phone number."
      actions={[
        { label: "Scan QR", onClick: () => navigate("/hospital/workers/scan"), variant: "secondary" },
        { label: "Workers", onClick: () => navigate("/hospital/manage-workers"), variant: "secondary" },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      {success && <div className="alert success" role="status">{success}</div>}
      <div className="scanner-layout">
        <section className="panel scanner-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Worker lookup</span>
              <h2>Search by phone</h2>
              <p>Use the worker's registered phone number.</p>
            </div>
          </div>
          <form onSubmit={handleSearch}>
            <div className="field">
              <label htmlFor="worker-phone">Phone number</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  id="worker-phone"
                  className="input"
                  type="tel"
                  inputMode="tel"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="9000000000"
                  autoComplete="tel"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="button button-primary" disabled={loading}>
                  {loading ? "Searching…" : "Find worker"}
                </button>
              </div>
            </div>
          </form>

          {worker && (
            <div style={{ marginTop: "22px" }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Worker</span>
                  <h2>{worker.fullName || "Worker"}</h2>
                  <p>{worker.workerCode || "Worker record"}</p>
                </div>
              </div>
              <div className="scan-success">
                <span className={`status-badge ${meta.tone}`}>{meta.label}</span>
                <div className="scan-details">
                  <span>
                    <small>Phone</small>
                    <strong>{worker.phone || "—"}</strong>
                  </span>
                  <span>
                    <small>Blood group</small>
                    <strong>{worker.bloodGroup || "—"}</strong>
                  </span>
                </div>
              </div>

              {relationship === "AVAILABLE" && (
                <div className="panel" style={{ marginTop: "12px" }}>
                  <span className="eyebrow">Next step</span>
                  <h3>Add to hospital</h3>
                  <p>Add this worker to this hospital's directory.</p>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleAdd}
                    disabled={adding}
                  >
                    {adding ? "Adding…" : "Add worker"}
                  </button>
                </div>
              )}

              {relationship === "OTHER_HOSPITAL" && (
                <div className="alert error" style={{ marginTop: "12px" }}>
                  This worker is associated with another hospital.
                </div>
              )}
            </div>
          )}
        </section>
        <aside className="card scanner-help">
          <span className="eyebrow">Workflow</span>
          <h3>Identify → Add → Manage</h3>
          <ol>
            <li>Find the worker using their unique phone number.</li>
            <li>Add them to the hospital directory if needed.</li>
            <li>Open their profile to view medical records and assign doctors.</li>
          </ol>
        </aside>
      </div>
    </RoleLayout>
  );
};

export default FindWorker;
