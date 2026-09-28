import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getWorkers, createWorker, activateWorker, deactivateWorker, getOrCreateWorkerQr, terminateHospitalRelationship } from "../../services/workerService";
import { getApiError } from "../../services/api";

const emptyForm = { fullName: "", email: "", password: "", dateOfBirth: "", gender: "", bloodGroup: "", phone: "", address: "", emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "" };

const WorkerManagement = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [selectedQr, setSelectedQr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrLoadingId, setQrLoadingId] = useState(null);
  const [terminatingId, setTerminatingId] = useState(null);

  const loadWorkers = useCallback(async () => {
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch (err) {
      setError(getApiError(err, "Unable to load workers."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      try {
        const data = await getWorkers();
        if (!ignore) setWorkers(data);
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Unable to load workers."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetch();
    return () => { ignore = true; };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault(); setError(""); setSuccess(""); setSaving(true);
    try { await createWorker(form); setForm(emptyForm); setShowForm(false); setSuccess("Worker registered. The profile is ready for doctor assignment."); await loadWorkers(); }
    catch (err) { setError(getApiError(err, "Unable to register worker.")); }
    finally { setSaving(false); }
  };

  const runAction = async (action, message) => {
    try { setError(""); setSuccess(""); await action(); setSuccess(message); await loadWorkers(); }
    catch (err) { setError(getApiError(err, "The action could not be completed.")); }
  };

  const handleTerminate = async (worker) => {
    const confirmed = window.confirm(
      `Terminate the hospital relationship with ${worker.fullName}? Their worker account and medical history will remain available, but this hospital will no longer be able to start new visits for them.`
    );
    if (!confirmed) return;
    try {
      setError(""); setSuccess(""); setTerminatingId(worker.id);
      await terminateHospitalRelationship(worker.id);
      setSuccess(`The hospital relationship with ${worker.fullName} has been terminated.`);
      await loadWorkers();
    } catch (err) {
      setError(getApiError(err, "Unable to terminate the hospital relationship."));
    } finally {
      setTerminatingId(null);
    }
  };

  const showQr = async (workerId) => {
    try {
      setError(""); setSuccess(""); setQrLoadingId(workerId);
      setSelectedQr(await getOrCreateWorkerQr(workerId));
    } catch (err) { setError(getApiError(err, "Unable to generate or load QR code.")); }
    finally { setQrLoadingId(null); }
  };

  const downloadQr = () => {
    if (!selectedQr?.qrImage) return;
    const link = document.createElement("a"); link.href = selectedQr.qrImage; link.download = `${selectedQr.workerCode || "worker"}-qr.png`; link.click();
  };

  const filteredWorkers = workers.filter((worker) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || `${worker.workerCode} ${worker.fullName} ${worker.phone || ""}`.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? worker.active : !worker.active);
    return matchesSearch && matchesStatus;
  });

  return <RoleLayout title="Workers" actions={[
    { label: "Scan QR", onClick: () => navigate("/hospital/workers/scan"), variant: "secondary" },
    { label: "Register worker", onClick: () => setShowForm(true) },
  ]}>
    {(error || success) && <div className={`alert ${error ? "error" : "success"}`} role="alert">{error || success}</div>}
    <div className="panel">
      <div className="section-toolbar"><div><h2>Worker directory</h2><span className="worker-count">{workers.length} worker{workers.length === 1 ? "" : "s"}</span></div><div className="toolbar-actions"><input className="input search-input" aria-label="Search workers" placeholder="Search workers…" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="select compact-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="ALL">All</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div></div>
      {loading ? <div className="loading-card">Loading workers…</div> : filteredWorkers.length === 0 ? <div className="empty-state-card"><h3>{search || statusFilter !== "ALL" ? "No matching workers" : "No workers registered yet"}</h3><p>{search || statusFilter !== "ALL" ? "Try another search or filter." : "Register a worker to create their DHRMS identity."}</p>{!search && statusFilter === "ALL" && <button className="button button-primary" onClick={() => setShowForm(true)}>Register first worker</button>}</div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Doctor</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredWorkers.map((worker) => <tr key={worker.id}><td><div className="person-cell"><span className="avatar">{(worker.fullName || "W").charAt(0)}</span><div><strong>{worker.fullName}</strong><small>{worker.workerCode}</small></div></div></td><td>{worker.assignedDoctor?.name || <span className="muted-note">Unassigned</span>}</td><td>{worker.phone || "—"}</td><td><span className={`status-badge ${worker.active ? "status-active" : "status-inactive"}`}>{worker.active ? "ACTIVE" : "INACTIVE"}</span></td><td><div className="row-actions"><button className="button button-primary button-small" onClick={() => navigate(`/hospital/workers/${worker.id}`)}>Open</button><button className="button button-secondary button-small" onClick={() => showQr(worker.id)} disabled={qrLoadingId === worker.id}>{qrLoadingId === worker.id ? "Loading…" : "QR"}</button>{worker.active ? <button className="button button-ghost button-small" onClick={() => runAction(() => deactivateWorker(worker.id), "Worker deactivated.")}>Deactivate</button> : <button className="button button-secondary button-small" onClick={() => runAction(() => activateWorker(worker.id), "Worker activated.")}>Activate</button>}{worker.active && <button className="button button-ghost button-small" onClick={() => handleTerminate(worker)} disabled={terminatingId === worker.id}>{terminatingId === worker.id ? "Ending…" : "End link"}</button>}</div></td></tr>)}</tbody></table></div>}
    </div>
    {showForm && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}><div className="modal modal-large"><div className="modal-header"><div><span className="eyebrow">New worker</span><h2>Register worker</h2></div><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">×</button></div><form onSubmit={handleCreate} className="form-grid"><div className="field"><label>Full name</label><input className="input" name="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div><div className="field"><label>Email</label><input className="input" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div><div className="field"><label>Temporary password</label><input className="input" type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div><div className="field"><label>Date of birth</label><input className="input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div><div className="field"><label>Gender</label><select className="select" name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div><div className="field"><label>Blood group</label><select className="select" name="bloodGroup" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}><option value="">Select blood group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div><div className="field"><label>Phone (Required & Unique)</label><input className="input" type="tel" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="e.g. 9876543210" /></div><div className="field full"><label>Address</label><input className="input" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div><div className="field"><label>Emergency contact</label><input className="input" name="emergencyContactName" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} /></div><div className="field"><label>Emergency phone</label><input className="input" type="tel" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} /></div><div className="field"><label>Relationship</label><select className="select" name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })}><option value="">Select relationship</option><option value="Spouse">Spouse</option><option value="Parent">Parent</option><option value="Child">Child</option><option value="Sibling">Sibling</option><option value="Relative">Relative</option><option value="Friend">Friend</option><option value="Employer">Employer</option><option value="Other">Other</option></select></div><div className="field full"><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Registering…" : "Register worker"}</button></div></div></form></div></div>}
    {selectedQr && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelectedQr(null)}><div className="modal qr-modal"><div className="modal-header"><div><h2>{selectedQr.workerCode}</h2></div><button className="modal-close" onClick={() => setSelectedQr(null)} aria-label="Close">×</button></div><div className="worker-id-card"><div className="id-card-brand">DHRMS <span>WORKER ID</span></div><img src={selectedQr.qrImage} alt={`QR code for ${selectedQr.workerCode}`} /></div><div className="modal-actions"><button className="button button-secondary" onClick={downloadQr}>Download QR</button><button className="button button-primary" onClick={() => setSelectedQr(null)}>Done</button></div></div></div>}
  </RoleLayout>;
};
export default WorkerManagement;
