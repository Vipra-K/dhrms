import { useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import {
  getWorkers,
  createWorker,
  activateWorker,
  deactivateWorker,
  generateWorkerQr,
  viewWorkerQr,
} from "../../services/workerService";

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQr = async (workerId) => {
    try {
      setError("");
      const data = await generateWorkerQr(workerId);
      setSelectedQr(data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to generate QR");
    }
  };

  const handleViewQr = async (workerId) => {
    try {
      setError("");
      const data = await viewWorkerQr(workerId);
      setSelectedQr(data);
    } catch (error) {
      setError(error.response?.data?.error || "QR code not found");
    }
  };

  const loadWorkers = async () => {
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load workers");
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createWorker(form);
      setForm({
        fullName: "",
        email: "",
        password: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        phone: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
      });
      await loadWorkers();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create worker");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateWorker(id);
      await loadWorkers();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to deactivate worker");
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateWorker(id);
      await loadWorkers();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to activate worker");
    }
  };

  return (
    <RoleLayout
      title="Worker Management"
      description="Register and manage migration workers within your hospital."
    >
      {error && <div className="alert error">{error}</div>}

      <div className="panel">
        <h2>Register Worker</h2>
        <form onSubmit={handleCreate} className="form-grid">
          <div className="field">
            <label>Full Name</label>
            <input className="input" name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Worker Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Worker Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Date of Birth</label>
            <input className="input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Gender</label>
            <select className="select" name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="field">
            <label>Blood Group</label>
            <input className="input" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Phone</label>
            <input className="input" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Address</label>
            <input className="input" name="address" value={form.address} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Emergency Contact Name</label>
            <input className="input" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Emergency Contact Phone</label>
            <input className="input" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Emergency Contact Relation</label>
            <input className="input" name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={handleChange} />
          </div>

          <div className="field full">
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? "Registering..." : "Register Worker"}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Workers List</h2>

        {workers.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-state-title">No workers found.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Worker ID</th>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>QR</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>{worker.workerCode}</td>
                    <td>{worker.fullName}</td>
                    <td>{worker.bloodGroup || "-"}</td>
                    <td>{worker.phone || "-"}</td>
                    <td>
                      <span className={`status-badge ${worker.active ? 'status-active' : 'status-inactive'}`}>
                        {worker.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {worker.active ? (
                          <button className="button button-ghost text-xs" onClick={() => handleDeactivate(worker.id)}>Deactivate</button>
                        ) : (
                          <button className="button button-secondary text-xs" onClick={() => handleActivate(worker.id)}>Activate</button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="button button-secondary text-xs" onClick={() => handleGenerateQr(worker.id)}>
                          Generate QR
                        </button>
                        <button className="button button-ghost text-xs" onClick={() => handleViewQr(worker.id)}>
                          View QR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedQr && (
          <div className="card mt-4 text-center">
            <h3>Worker ID Card QR</h3>
            <p className="mb-4">Worker ID: {selectedQr.workerCode}</p>
            <img src={selectedQr.qrImage} alt="Worker QR Code" style={{ maxWidth: '200px', borderRadius: '12px', border: '2px solid var(--border)', marginBottom: '16px' }} />
            <br />
            <button className="button button-secondary" onClick={() => setSelectedQr(null)}>Close QR</button>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default WorkerManagement;
