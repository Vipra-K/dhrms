import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getDoctors, createDoctor, suspendDoctor, activateDoctor, deactivateDoctor } from "../../services/doctorService";

const emptyForm = { fullName: "", email: "", password: "", specialization: "", licenseNumber: "", department: "", role: "JUNIOR_DOCTOR", workingHoursStart: "09:00", workingHoursEnd: "17:00" };

const DoctorManagement = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadDoctors = async () => {
    try { setError(""); setDoctors(await getDoctors()); }
    catch (err) { setError(err.response?.data?.error || "Unable to load doctors."); }
  };
  useEffect(() => { loadDoctors(); }, []);

  const handleCreate = async (event) => {
    event.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      await createDoctor(form);
      setForm(emptyForm);
      setSuccess("Doctor account created successfully.");
      await loadDoctors();
    } catch (err) { setError(err.response?.data?.error || "Unable to create doctor."); }
    finally { setLoading(false); }
  };

  const runAction = async (action, message) => {
    try { setError(""); await action(); setSuccess(message); await loadDoctors(); }
    catch (err) { setError(err.response?.data?.error || "The action could not be completed."); }
  };

  const filteredDoctors = doctors.filter((doctor) => `${doctor.fullName} ${doctor.email} ${doctor.specialization || ""} ${doctor.licenseNumber || ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <RoleLayout title="Doctors" description="Manage the clinicians working in your hospital.">
      {(error || success) && <div className={`alert ${error ? "error" : "success"}`} role="alert">{error || success}</div>}

      <div className="section-toolbar"><div><h2>Doctor directory</h2><p>{doctors.length} registered clinician{doctors.length === 1 ? "" : "s"}</p></div><div className="toolbar-actions"><input className="input search-input" placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} /><button className="button button-primary" onClick={() => document.getElementById("doctor-registration")?.scrollIntoView({ behavior: "smooth" })}>+ Register doctor</button></div></div>

      <div className="panel table-panel">
        {filteredDoctors.length === 0 ? <div className="empty-state-card"><span className="empty-icon">D</span><h3>{search ? "No doctors match your search" : "No doctors registered yet"}</h3><p>{search ? "Try a different name, email or license number." : "Register your first clinician below to start assigning care."}</p></div> : <div className="table-card"><table className="table"><thead><tr><th>Doctor</th><th>Specialization</th><th>Department</th><th>Role</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredDoctors.map((doctor) => <tr key={doctor.id}><td><div className="person-cell"><span className="avatar">{(doctor.fullName || "D").charAt(0)}</span><div><strong>{doctor.fullName}</strong><small>{doctor.email}</small></div></div></td><td>{doctor.specialization || "—"}</td><td>{doctor.department || "—"}</td><td>{doctor.role?.replaceAll("_", " ") || "—"}</td><td>{doctor.workingHoursStart && doctor.workingHoursEnd ? `${doctor.workingHoursStart}–${doctor.workingHoursEnd}` : "—"}</td><td><span className={`status-badge ${doctor.status === "ACTIVE" ? "status-active" : doctor.status === "SUSPENDED" ? "status-suspended" : "status-inactive"}`}>{doctor.status}</span></td><td><div className="row-actions">{doctor.status === "ACTIVE" && <button className="button button-secondary button-small" onClick={() => runAction(() => suspendDoctor(doctor.id), "Doctor suspended.")}>Suspend</button>}{doctor.status === "SUSPENDED" && <button className="button button-secondary button-small" onClick={() => runAction(() => activateDoctor(doctor.id), "Doctor activated.")}>Activate</button>}{doctor.status !== "INACTIVE" && <button className="button button-ghost button-small" onClick={() => runAction(() => deactivateDoctor(doctor.id), "Doctor deactivated.")}>Deactivate</button>}{doctor.id && <button className="button button-ghost button-small" onClick={() => navigate(`/hospital/doctors/${doctor.id}`)}>View</button>}</div></td></tr>)}</tbody></table></div>}
      </div>

      <div className="panel registration-panel" id="doctor-registration"><div className="panel-heading"><div><span className="eyebrow">New account</span><h2>Register doctor</h2><p>Create a clinician account for this hospital.</p></div></div>
        <form onSubmit={handleCreate} className="form-grid">
          <div className="field"><label>Full name</label><input className="input" name="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
          <div className="field"><label>Email</label><input className="input" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="field"><label>Temporary password</label><input className="input" type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div className="field"><label>Specialization</label><input className="input" name="specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
          <div className="field"><label>Medical license</label><input className="input" name="licenseNumber" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></div>
          <div className="field"><label>Department</label><input className="input" name="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          <div className="field"><label>Professional role</label><select className="select" name="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="SENIOR_CONSULTANT">Senior Consultant</option><option value="JUNIOR_DOCTOR">Junior Doctor</option><option value="RESIDENT">Resident</option><option value="READ_ONLY">Read Only</option></select></div>
          <div className="field"><label>Working hours — start</label><input className="input" type="time" name="workingHoursStart" value={form.workingHoursStart} onChange={(e) => setForm({ ...form, workingHoursStart: e.target.value })} /></div>
          <div className="field"><label>Working hours — end</label><input className="input" type="time" name="workingHoursEnd" value={form.workingHoursEnd} onChange={(e) => setForm({ ...form, workingHoursEnd: e.target.value })} /></div>
          <div className="field full"><div className="form-note">Working hours are included in the form and sent with the registration request. The NestJS create-doctor DTO must accept these fields for them to be persisted.</div><button className="button button-primary" disabled={loading}>{loading ? "Creating doctor..." : "Create doctor"}</button></div>
        </form>
      </div>
    </RoleLayout>
  );
};
export default DoctorManagement;
