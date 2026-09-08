import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getDoctors, createDoctor, suspendDoctor, activateDoctor, deactivateDoctor } from "../../services/doctorService";
import { getApiError } from "../../services/api";

const emptyForm = { fullName: "", email: "", password: "", specialization: "", licenseNumber: "", department: "", role: "JUNIOR_DOCTOR", workingHoursStart: "09:00", workingHoursEnd: "17:00" };

const DoctorManagement = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadDoctors = useCallback(async () => {
    try {
      setError("");
      const data = await getDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err, "Unable to load doctors."));
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await createDoctor(form);
      setForm(emptyForm); setShowForm(false);
      setSuccess("Doctor created.");
      await loadDoctors();
    } catch (err) { setError(getApiError(err, "Unable to create doctor.")); }
    finally { setLoading(false); }
  };

  const runAction = async (action, message) => {
    try { setError(""); setSuccess(""); await action(); setSuccess(message); await loadDoctors(); }
    catch (err) { setError(getApiError(err, "Action could not be completed.")); }
  };

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter((doctor) => `${doctor.fullName} ${doctor.email} ${doctor.specialization || ""} ${doctor.licenseNumber || ""} ${doctor.department || ""}`.toLowerCase().includes(query));
  }, [doctors, search]);
  const activeDoctors = doctors.filter((doctor) => doctor.status === "ACTIVE").length;

  return (
    <RoleLayout title="Doctors" description="Hospital doctor directory." actions={[{ label: "Register doctor", onClick: () => setShowForm(true) }]}>
      {(error || success) && <div className={`alert ${error ? "error" : "success"}`} role="alert">{error || success}</div>}
      <section className="panel">
        <div className="section-toolbar">
          <div><span className="eyebrow">Doctors</span><h2>{doctors.length} doctor{doctors.length === 1 ? "" : "s"}</h2><p>{activeDoctors} active</p></div>
          <div className="toolbar-actions"><input className="input search-input" aria-label="Search doctors" placeholder="Search doctors" value={search} onChange={(e) => setSearch(e.target.value)} /><button className="button button-secondary" type="button" onClick={loadDoctors} disabled={initialLoading}>{initialLoading ? "Loading…" : "Refresh"}</button></div>
        </div>
        {initialLoading ? <div className="loading-card">Loading doctors…</div> : filteredDoctors.length === 0 ? (
          <div className="empty-state-card"><h3>{search ? "No doctors found" : "No doctors yet"}</h3><p>{search ? "Try another search." : "Register a doctor to get started."}</p>{!search && <button className="button button-primary" type="button" onClick={() => setShowForm(true)}>Register doctor</button>}</div>
        ) : (
          <div className="table-card"><table className="table"><thead><tr><th>Doctor</th><th>Specialization</th><th>Department</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {filteredDoctors.map((doctor) => <tr key={doctor.id}>
              <td><div className="person-cell"><span className="avatar">{(doctor.fullName || "D").charAt(0).toUpperCase()}</span><div><strong>{doctor.fullName || "Doctor"}</strong><small>{doctor.email || "—"}</small></div></div></td>
              <td>{doctor.specialization || "—"}</td><td>{doctor.department || "—"}</td><td>{doctor.workingHoursStart && doctor.workingHoursEnd ? `${doctor.workingHoursStart}–${doctor.workingHoursEnd}` : "—"}</td>
              <td><span className={`status-badge ${doctor.status === "ACTIVE" ? "status-active" : doctor.status === "SUSPENDED" ? "status-suspended" : "status-inactive"}`}>{doctor.status || "UNKNOWN"}</span></td>
              <td><div className="row-actions">{doctor.status === "ACTIVE" && <button className="button button-secondary button-small" type="button" onClick={() => runAction(() => suspendDoctor(doctor.id), "Doctor suspended.")}>Suspend</button>}{doctor.status === "SUSPENDED" && <button className="button button-secondary button-small" type="button" onClick={() => runAction(() => activateDoctor(doctor.id), "Doctor activated.")}>Activate</button>}{doctor.status !== "INACTIVE" && <button className="button button-ghost button-small" type="button" onClick={() => runAction(() => deactivateDoctor(doctor.id), "Doctor deactivated.")}>Deactivate</button>}<button className="button button-ghost button-small" type="button" onClick={() => navigate(`/hospital/doctors/${doctor.id}`)}>View</button></div></td>
            </tr>)}
          </tbody></table></div>
        )}
      </section>
      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}><div className="modal modal-large" role="dialog" aria-modal="true" aria-labelledby="register-doctor-title">
        <div className="modal-header"><div><span className="eyebrow">New doctor</span><h2 id="register-doctor-title">Register doctor</h2></div><button className="modal-close" type="button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div>
        <form onSubmit={handleCreate} className="form-grid">
          <div className="field"><label htmlFor="doctor-full-name">Full name</label><input id="doctor-full-name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
          <div className="field"><label htmlFor="doctor-email">Email</label><input id="doctor-email" className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="field"><label htmlFor="doctor-password">Temporary password</label><input id="doctor-password" className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div className="field"><label htmlFor="doctor-specialization">Specialization</label><input id="doctor-specialization" className="input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
          <div className="field"><label htmlFor="doctor-license">Medical license</label><input id="doctor-license" className="input" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></div>
          <div className="field"><label htmlFor="doctor-department">Department</label><input id="doctor-department" className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          <div className="field"><label htmlFor="doctor-role">Role</label><select id="doctor-role" className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="SENIOR_CONSULTANT">Senior Consultant</option><option value="JUNIOR_DOCTOR">Junior Doctor</option><option value="RESIDENT">Resident</option><option value="READ_ONLY">Read Only</option></select></div>
          <div className="field"><label htmlFor="doctor-start">Start time</label><input id="doctor-start" className="input" type="time" value={form.workingHoursStart} onChange={(e) => setForm({ ...form, workingHoursStart: e.target.value })} /></div>
          <div className="field"><label htmlFor="doctor-end">End time</label><input id="doctor-end" className="input" type="time" value={form.workingHoursEnd} onChange={(e) => setForm({ ...form, workingHoursEnd: e.target.value })} /></div>
          <div className="field full"><div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={loading}>{loading ? "Creating…" : "Create doctor"}</button></div></div>
        </form>
      </div></div>}
    </RoleLayout>
  );
};
export default DoctorManagement;
