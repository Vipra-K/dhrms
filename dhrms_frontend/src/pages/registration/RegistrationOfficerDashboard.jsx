import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { registerWorker, getRegisteredWorker, getRegisteredWorkers, checkWorkerPhone } from "../../services/registrationService";
import { getApiError } from "../../services/api";

const initialForm = { fullName: "", dateOfBirth: "", gender: "", bloodGroup: "", phone: "", address: "", emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "", employerName: "", worksiteName: "", worksiteAddress: "", worksiteDistrict: "", jobRole: "", email: "", password: "" };
const fmtDate = (v) => v ? new Date(v).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (v) => v ? new Date(v).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const dash = (v) => v || "—";

const RegistrationOfficerDashboard = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const section = pathname.endsWith("/register") ? "register" : pathname.endsWith("/workers") ? "workers" : "dashboard";
  const [form, setForm] = useState(initialForm);
  const [workers, setWorkers] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [error, setError] = useState("");

  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const loadWorkers = useCallback(async (query = "") => {
    setLoading(true); setError("");
    try { setWorkers(await getRegisteredWorkers(query)); }
    catch (err) { setError(getApiError(err, "Unable to load registered workers.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadWorkers(); }, [loadWorkers]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    return { total: workers.length, today: workers.filter((w) => new Date(w.createdAt) >= today).length, month: workers.filter((w) => new Date(w.createdAt) >= month).length, active: workers.filter((w) => w.active).length };
  }, [workers]);

  const checkPhone = async () => {
    if (!form.phone.trim()) return;
    setCheckingPhone(true); setPhoneStatus(null); setError("");
    try { const response = await checkWorkerPhone(form.phone.trim()); setPhoneStatus(response.exists ? { exists: true, worker: response.worker } : { exists: false }); }
    catch (err) { setError(getApiError(err, "Unable to check the phone number.")); }
    finally { setCheckingPhone(false); }
  };

  const review = async (event) => {
    event.preventDefault(); setError("");
    if (!form.fullName.trim()) return setError("Full name is required.");
    if (form.email && !form.password) return setError("Password is required when worker email is provided.");
    if (!form.email && form.password) return setError("Email is required when a worker password is provided.");
    if (phoneStatus?.exists) return setError("This phone number is already registered.");
    if (form.phone && !phoneStatus) { await checkPhone(); return; }
    setReviewing(true);
  };

  const confirmRegistration = async () => {
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (!payload.email) delete payload.email;
      if (!payload.password) delete payload.password;
      const registered = await registerWorker(payload);
      setResult(registered); setForm(initialForm); setPhoneStatus(null); setReviewing(false); await loadWorkers();
    } catch (err) { setError(getApiError(err, "Unable to register worker.")); setReviewing(false); }
    finally { setSaving(false); }
  };

  const openWorker = async (id) => {
    setProfileLoading(true); setError("");
    try { setSelectedWorker(await getRegisteredWorker(id)); }
    catch (err) { setError(getApiError(err, "Unable to load worker profile.")); }
    finally { setProfileLoading(false); }
  };

  const downloadQr = (worker) => {
    if (!worker?.qrImage) return;
    const link = document.createElement("a"); link.href = worker.qrImage; link.download = `${worker.workerCode}-QR.png`; document.body.appendChild(link); link.click(); link.remove();
  };

  const printCard = (worker) => {
    if (!worker) return;
    const popup = window.open("", "_blank", "width=520,height=700");
    if (!popup) return;
    popup.document.write(`<!doctype html><html><head><title>${worker.workerCode}</title><style>body{font-family:Arial,sans-serif;padding:36px;text-align:center}img{width:300px;height:300px}.id{font-size:24px;font-weight:700;margin:18px 0}.muted{color:#666}</style></head><body><h1>DHRMS</h1><p>Digital Health Records</p>${worker.qrImage ? `<img src="${worker.qrImage}" alt="Worker QR">` : ""}<div class="id">${worker.workerCode}</div><p>${worker.fullName}</p><p class="muted">Scan this QR at a DHRMS-enabled healthcare facility.</p><script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  };

  const profile = selectedWorker && <div className="panel">
    <div className="panel-heading"><div><span className="eyebrow">Worker profile</span><h2>{selectedWorker.fullName}</h2><p>{selectedWorker.workerCode}</p></div><div className="row-actions"><span className={`status-badge ${selectedWorker.active ? "status-active" : "status-inactive"}`}>{selectedWorker.active ? "ACTIVE" : "INACTIVE"}</span><button className="button button-secondary button-small" type="button" onClick={() => setSelectedWorker(null)}>Close</button></div></div>
    <div className="profile-grid">{[["Worker ID", selectedWorker.workerCode], ["Registration status", selectedWorker.registrationStatus], ["QR status", selectedWorker.qrStatus], ["Registered on", fmtDateTime(selectedWorker.createdAt)], ["Date of birth", fmtDate(selectedWorker.dateOfBirth)], ["Gender", dash(selectedWorker.gender)], ["Blood group", dash(selectedWorker.bloodGroup)], ["Phone", dash(selectedWorker.phone)], ["Address", dash(selectedWorker.address)], ["Employer", dash(selectedWorker.employerName)], ["Job role", dash(selectedWorker.jobRole)], ["Worksite", dash(selectedWorker.worksiteName)], ["District", dash(selectedWorker.worksiteDistrict)], ["Worksite address", dash(selectedWorker.worksiteAddress)], ["Emergency contact", dash(selectedWorker.emergencyContactName)], ["Emergency phone", dash(selectedWorker.emergencyContactPhone)], ["Relationship", dash(selectedWorker.emergencyContactRelation)]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    {selectedWorker.qrImage && <div className="worker-id-card" style={{ marginTop: 18, textAlign: "center" }}><div className="id-card-brand">DHRMS <span>WORKER ID</span></div><img src={selectedWorker.qrImage} alt={`QR code for ${selectedWorker.workerCode}`} style={{ width: 260, maxWidth: "100%" }} /><p>Scan this QR at a DHRMS-enabled healthcare facility.</p><div className="modal-actions"><button className="button button-primary" type="button" onClick={() => downloadQr(selectedWorker)}>Download QR</button><button className="button button-secondary" type="button" onClick={() => printCard(selectedWorker)}>Print worker card</button></div></div>}
  </div>;

  const registrationForm = reviewing ? <div className="panel"><div className="panel-heading"><div><span className="eyebrow">Review before registration</span><h2>Confirm worker information</h2><p>Verify the details before creating the permanent DHRMS identity.</p></div></div><div className="profile-grid">{[["Full name", form.fullName], ["Date of birth", fmtDate(form.dateOfBirth)], ["Gender", dash(form.gender)], ["Blood group", dash(form.bloodGroup)], ["Phone", dash(form.phone)], ["Address", dash(form.address)], ["Employer", dash(form.employerName)], ["Job role", dash(form.jobRole)], ["Worksite", dash(form.worksiteName)], ["District", dash(form.worksiteDistrict)], ["Emergency contact", dash(form.emergencyContactName)], ["Emergency phone", dash(form.emergencyContactPhone)], ["Portal email", dash(form.email)]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => setReviewing(false)}>Back to edit</button><button className="button button-primary" type="button" disabled={saving} onClick={confirmRegistration}>{saving ? "Registering…" : "Confirm & register worker"}</button></div></div> : <form onSubmit={review} className="panel form-grid">
    <div className="field full"><span className="eyebrow">Identity</span><h2>Worker details</h2><p>Verify the worker's identity before issuing a permanent DHRMS identity.</p></div>
    <div className="field"><label>Full name</label><input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required /></div><div className="field"><label>Date of birth</label><input className="input" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></div>
    <div className="field"><label>Gender</label><select className="select" value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div><div className="field"><label>Blood group</label><input className="input" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} /></div>
    <div className="field full"><label>Phone</label><div className="toolbar-actions"><input className="input" value={form.phone} onChange={(e) => { set("phone", e.target.value); setPhoneStatus(null); }} /><button type="button" className="button button-secondary" disabled={!form.phone || checkingPhone} onClick={checkPhone}>{checkingPhone ? "Checking…" : "Check existing"}</button></div>{phoneStatus?.exists && <div className="alert error">Already registered to {phoneStatus.worker.fullName} ({phoneStatus.worker.workerCode}).</div>}{phoneStatus && !phoneStatus.exists && <div className="alert success">No existing worker found for this phone number.</div>}</div>
    <div className="field full"><label>Address</label><input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
    <div className="field full"><span className="eyebrow">Employment verification</span><h2>Worksite details</h2><p>These details establish the worker's employment context.</p></div>
    <div className="field"><label>Employer / contractor</label><input className="input" value={form.employerName} onChange={(e) => set("employerName", e.target.value)} /></div><div className="field"><label>Job role</label><input className="input" value={form.jobRole} onChange={(e) => set("jobRole", e.target.value)} placeholder="e.g. Mason" /></div><div className="field"><label>Worksite name</label><input className="input" value={form.worksiteName} onChange={(e) => set("worksiteName", e.target.value)} /></div><div className="field"><label>Worksite district</label><input className="input" value={form.worksiteDistrict} onChange={(e) => set("worksiteDistrict", e.target.value)} /></div><div className="field full"><label>Worksite address</label><input className="input" value={form.worksiteAddress} onChange={(e) => set("worksiteAddress", e.target.value)} /></div>
    <div className="field full"><span className="eyebrow">Emergency contact</span><h2>Safety information</h2></div><div className="field"><label>Contact name</label><input className="input" value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} /></div><div className="field"><label>Contact phone</label><input className="input" value={form.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} /></div><div className="field"><label>Relationship</label><input className="input" value={form.emergencyContactRelation} onChange={(e) => set("emergencyContactRelation", e.target.value)} /></div>
    <div className="field full"><span className="eyebrow">Optional worker login</span><h2>Portal access</h2><p>Leave blank when assisted access is sufficient.</p></div><div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div><div className="field"><label>Password</label><input className="input" type="password" minLength="6" value={form.password} onChange={(e) => set("password", e.target.value)} /></div>
    <div className="field full"><div className="modal-actions"><button type="submit" className="button button-primary">Review registration</button></div></div>
  </form>;

  const workersView = <><div className="panel"><div className="section-toolbar"><div><span className="eyebrow">Worker registry</span><h2>Registered workers</h2><p>Search by worker name, phone number or DHRMS worker ID.</p></div><div className="toolbar-actions"><input className="input search-input" placeholder="Name, phone or worker ID" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadWorkers(search)} /><button className="button button-primary" type="button" onClick={() => loadWorkers(search)}>Search</button><button className="button button-secondary" type="button" onClick={() => { setSearch(""); loadWorkers(); }}>Reset</button></div></div></div>{profile}{loading ? <div className="loading-card">Loading workers…</div> : <div className="panel table-panel"><div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Worker ID</th><th>Phone</th><th>Registered</th><th>Status</th><th /></tr></thead><tbody>{workers.map((w) => <tr key={w.id}><td><div className="person-cell"><span className="avatar">{w.fullName.charAt(0).toUpperCase()}</span><div><strong>{w.fullName}</strong><small>{w.jobRole || "Worker"}</small></div></div></td><td>{w.workerCode}</td><td>{w.phone || "—"}</td><td>{fmtDateTime(w.createdAt)}</td><td><span className={`status-badge ${w.active ? "status-active" : "status-inactive"}`}>{w.active ? "ACTIVE" : "INACTIVE"}</span></td><td><button className="button button-secondary button-small" type="button" onClick={() => openWorker(w.id)}>View profile</button></td></tr>)}</tbody></table></div></div>}</>;

  const dashboard = <><div className="dashboard-welcome"><div><span className="eyebrow">Registration operations</span><h2>Worker registration dashboard</h2><p>Register workers, review your registration activity and retrieve issued identities.</p></div><div className="dashboard-mark">ID</div></div><div className="workflow-grid">{[["Total workers", stats.total, "All workers registered by you"], ["Registered today", stats.today, "New registrations today"], ["This month", stats.month, "Registrations this month"], ["Active identities", stats.active, "Currently active workers"]].map(([label, value, hint]) => <div className="workflow-card" key={label}><span className="eyebrow">{label}</span><h3 style={{ fontSize: 28, marginTop: 18 }}>{value}</h3><p>{hint}</p></div>)}</div><div className="panel table-panel"><div className="panel-heading" style={{ padding: "24px 24px 0" }}><div><span className="eyebrow">Recent activity</span><h2>Recent registrations</h2><p>Your latest worker registrations.</p></div><button className="button button-secondary button-small" type="button" onClick={() => navigate("/registration/workers")}>View all</button></div>{loading ? <div className="loading-card">Loading registrations…</div> : workers.length === 0 ? <div className="empty-state-card"><div className="empty-icon">ID</div><h3>No workers registered yet</h3><p>Start by registering your first worker.</p><button className="button button-primary" type="button" onClick={() => navigate("/registration/register")}>Register worker</button></div> : <div className="table-card"><table className="table"><thead><tr><th>Worker</th><th>Worker ID</th><th>Registered</th><th>Status</th><th /></tr></thead><tbody>{workers.slice(0, 6).map((w) => <tr key={w.id}><td><div className="person-cell"><span className="avatar">{w.fullName.charAt(0).toUpperCase()}</span><div><strong>{w.fullName}</strong><small>{w.phone || "No phone"}</small></div></div></td><td>{w.workerCode}</td><td>{fmtDateTime(w.createdAt)}</td><td><span className="status-badge status-active">{w.registrationStatus}</span></td><td><button className="button button-secondary button-small" type="button" onClick={() => openWorker(w.id)}>View</button></td></tr>)}</tbody></table></div>}</div></>;

  return <RoleLayout title={section === "register" ? "Register worker" : section === "workers" ? "Registered workers" : "Registration officer dashboard"} description={section === "register" ? "Verify worker information and issue a permanent DHRMS identity." : section === "workers" ? "Search and review workers registered by your officer account." : "Manage worker registration and issued DHRMS identities."} hideHeader={section === "dashboard"} hideBreadcrumbs={section === "dashboard"} actions={section === "register" ? [{ label: "Back to dashboard", variant: "secondary", onClick: () => navigate("/registration") }] : [{ label: "Register worker", onClick: () => navigate("/registration/register") }]}>
    {error && <div className="alert error" role="alert">{error}</div>}
    {result && <div className="panel"><div className="panel-heading"><div><span className="eyebrow">Registration complete</span><h2>{result.workerCode}</h2><p>{result.fullName} now has a permanent DHRMS identity.</p></div><span className="status-badge status-active">{result.registrationStatus}</span></div><div className="worker-id-card" style={{ textAlign: "center" }}><div className="id-card-brand">DHRMS <span>WORKER ID</span></div>{result.qrImage && <img src={result.qrImage} alt={`QR code for ${result.workerCode}`} style={{ width: 300, maxWidth: "100%" }} />}<h3 style={{ marginTop: 12 }}>{result.workerCode}</h3><p>Give this QR card to the worker. Hospitals use it to identify the worker and start a visit.</p><div className="modal-actions"><button className="button button-primary" type="button" onClick={() => downloadQr(result)}>Download QR</button><button className="button button-secondary" type="button" onClick={() => printCard(result)}>Print worker card</button><button className="button button-secondary" type="button" onClick={() => { setResult(null); navigate("/registration/register"); }}>Register another</button><button className="button button-ghost" type="button" onClick={() => { setResult(null); navigate("/registration/workers"); openWorker(result.id); }}>View worker</button></div></div></div>}
    {!result && section === "dashboard" && dashboard}
    {!result && section === "register" && registrationForm}
    {!result && section === "workers" && workersView}
    {profileLoading && <div className="loading-card">Loading worker profile…</div>}
  </RoleLayout>;
};

export default RegistrationOfficerDashboard;
