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

  return <RoleLayout title="Workers" description="One directory for registration, search, QR identification, assignment and worker profiles." actions={[
    { label: "Scan QR", onClick: () => navigate("/hospital/workers/scan"), variant: "secondary" },
    { label: "Register worker", onClick: () => setShowForm(true) },
  ]}>
    {(error || success) && <div className={`alert ${error ? "error" : "success"}`} role="alert">{error || success}</div>}
    <div className="panel">
      <div className="section-toolbar"><div><span className="eyebrow">Worker directory</span><h2>{workers.length} worker{workers.length === 1 ? "" : "s"}</h2><p>Search or scan a worker, then continue from their profile.</p></div><div className="toolbar-actions"><input className="input search-input" aria-label="Search workers" placeholder="Search ID, name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="select compact-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div></div>
      {loading ? <div className="loading-card">Loading workers…</div> : filteredWorkers.length === 0 ? <div className="empty-state-card"><h3>{search || statusFilter !== "ALL" ? "No matching workers" : "No workers registered yet"}</h3><p>{search || statusFilter !== "ALL" ? "Try another search or filter." : "Register a worker to create their DHRMS identity."}</p>{!search && statusFilter === "ALL" && <button className="button button-primary" onClick={() => setShowForm(true)}>Register first worker</button>}</div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Doctor</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredWorkers.map((worker) => <tr key={worker.id}><td><div className="person-cell"><span className="avatar">{(worker.fullName || "W").charAt(0)}</span><div><strong>{worker.fullName}</strong><small>{worker.workerCode}</small></div></div></td><td>{worker.assignedDoctor?.name || <span className="muted-note">Unassigned</span>}</td><td>{worker.phone || "—"}</td><td><span className={`status-badge ${worker.active ? "status-active" : "status-inactive"}`}>{worker.active ? "ACTIVE" : "INACTIVE"}</span></td><td><div className="row-actions"><button className="button button-primary button-small" onClick={() => navigate(`/hospital/workers/${worker.id}`)}>Open profile</button><button className="button button-secondary button-small" onClick={() => showQr(worker.id)} disabled={qrLoadingId === worker.id}>{qrLoadingId === worker.id ? "Loading…" : "QR"}</button>{worker.active ? <button className="button button-ghost button-small" onClick={() => runAction(() => deactivateWorker(worker.id), "Worker deactivated.")}>Deactivate</button> : <button className="button button-secondary button-small" onClick={() => runAction(() => activateWorker(worker.id), "Worker activated.")}>Activate</button>}{worker.active && <button className="button button-ghost button-small" onClick={() => handleTerminate(worker)} disabled={terminatingId === worker.id}>{terminatingId === worker.id ? "Terminating…" : "Terminate relationship"}</button>}</div></td></tr>)}</tbody></table></div>}
    </div>
    {showForm && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}><div className="modal modal-large"><div className="modal-header"><div><span className="eyebrow">New worker</span><h2>Register worker</h2><p>The worker becomes visible immediately, even before a doctor is assigned.</p></div><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">×</button></div><form onSubmit={handleCreate} className="form-grid"><div className="field"><label>Full name</label><input className="input" name="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div><div className="field"><label>Email</label><input className="input" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div><div className="field"><label>Temporary password</label><input className="input" type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div><div className="field"><label>Date of birth</label><input className="input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div><div className="field"><label>Gender</label><select className="select" name="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div><div className="field"><label>Blood group</label><input className="input" name="bloodGroup" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} /></div><div className="field"><label>Phone</label><input className="input" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div><div className="field full"><label>Address</label><input className="input" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div><div className="field"><label>Emergency contact</label><input className="input" name="emergencyContactName" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} /></div><div className="field"><label>Emergency phone</label><input className="input" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} /></div><div className="field"><label>Relationship</label><input className="input" name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })} /></div><div className="field full"><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Registering…" : "Register worker"}</button></div></div></form></div></div>}
    {selectedQr && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelectedQr(null)}><div className="modal qr-modal"><div className="modal-header"><div><span className="eyebrow">Worker identity</span><h2>{selectedQr.workerCode}</h2></div><button className="modal-close" onClick={() => setSelectedQr(null)} aria-label="Close">×</button></div><div className="worker-id-card"><div className="id-card-brand">DHRMS <span>WORKER ID</span></div><img src={selectedQr.qrImage} alt={`QR code for ${selectedQr.workerCode}`} /><p>Scan this QR to identify the worker in DHRMS.</p></div><div className="modal-actions"><button className="button button-secondary" onClick={downloadQr}>Download QR</button><button className="button button-primary" onClick={() => setSelectedQr(null)}>Done</button></div></div></div>}
  </RoleLayout>;
};
export default WorkerManagement;
