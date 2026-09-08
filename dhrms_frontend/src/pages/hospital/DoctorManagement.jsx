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

  useEffect(() => {
    let ignore = false;
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        if (!ignore) setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Unable to load doctors."));
      } finally {
        if (!ignore) setInitialLoading(false);
      }
    };
    fetchDoctors();
    return () => { ignore = true; };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await createDoctor(form);
      setForm(emptyForm);
      setShowForm(false);
      setSuccess("Doctor account created successfully.");
      await loadDoctors();
    } catch (err) {
      setError(getApiError(err, "Unable to create doctor."));
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (action, message) => {
    try {
      setError("");
      setSuccess("");
      await action();
      setSuccess(message);
      await loadDoctors();
    } catch (err) {
      setError(getApiError(err, "The action could not be completed."));
    }
  };

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter((doctor) => `${doctor.fullName} ${doctor.email} ${doctor.specialization || ""} ${doctor.licenseNumber || ""} ${doctor.department || ""}`.toLowerCase().includes(query));
  }, [doctors, search]);

  const activeDoctors = doctors.filter((doctor) => doctor.status === "ACTIVE").length;

  return (
    <RoleLayout
      title="Doctors"
      description="Manage clinicians who can be assigned to workers and handle active visits at this hospital."
      actions={[{ label: "Register doctor", onClick: () => setShowForm(true) }]}
    >
      {(error || success) && <div className={`alert ${error ? "error" : "success"}`} role="alert">{error || success}</div>}

      <section className="panel">
        <div className="section-toolbar">
          <div><span className="eyebrow">Clinical team</span><h2>{doctors.length} doctor{doctors.length === 1 ? "" : "s"}</h2><p>{activeDoctors} currently active and available for clinical assignment.</p></div>
          <div className="toolbar-actions"><input className="input search-input" aria-label="Search doctors" placeholder="Name, email, specialization, license…" value={search} onChange={(e) => setSearch(e.target.value)} /><button className="button button-secondary" type="button" onClick={loadDoctors} disabled={initialLoading}>{initialLoading ? "Loading…" : "Refresh"}</button></div>
        </div>

        {initialLoading ? (
          <div className="loading-card">Loading doctors…</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="empty-state-card"><span className="empty-icon">D</span><h3>{search ? "No doctors match your search" : "No doctors registered yet"}</h3><p>{search ? "Try a different search term." : "Register a clinician to begin assigning care."}</p>{!search && <button className="button button-primary" type="button" onClick={() => setShowForm(true)}>Register first doctor</button>}</div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Doctor</th><th>Specialization</th><th>Department</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td><div className="person-cell"><span className="avatar">{(doctor.fullName || "D").charAt(0).toUpperCase()}</span><div><strong>{doctor.fullName || "Doctor"}</strong><small>{doctor.email || "No email"}</small></div></div></td>
                    <td>{doctor.specialization || "—"}</td>
                    <td>{doctor.department || "—"}</td>
                    <td>{doctor.workingHoursStart && doctor.workingHoursEnd ? `${doctor.workingHoursStart}–${doctor.workingHoursEnd}` : "—"}</td>
                    <td><span className={`status-badge ${doctor.status === "ACTIVE" ? "status-active" : doctor.status === "SUSPENDED" ? "status-suspended" : "status-inactive"}`}>{doctor.status || "UNKNOWN"}</span></td>
                    <td><div className="row-actions">{doctor.status === "ACTIVE" && <button className="button button-secondary button-small" type="button" onClick={() => runAction(() => suspendDoctor(doctor.id), "Doctor suspended.")}>Suspend</button>}{doctor.status === "SUSPENDED" && <button className="button button-secondary button-small" type="button" onClick={() => runAction(() => activateDoctor(doctor.id), "Doctor activated.")}>Activate</button>}{doctor.status !== "INACTIVE" && <button className="button button-ghost button-small" type="button" onClick={() => runAction(() => deactivateDoctor(doctor.id), "Doctor deactivated.")}>Deactivate</button>}<button className="button button-ghost button-small" type="button" onClick={() => navigate(`/hospital/doctors/${doctor.id}`)}>View</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal modal-large" role="dialog" aria-modal="true" aria-labelledby="register-doctor-title">
            <div className="modal-header">
              <div><span className="eyebrow">New clinician</span><h2 id="register-doctor-title">Register doctor</h2><p>Create a hospital doctor account with the same registration details already supported by DHRMS.</p></div>
              <button className="modal-close" type="button" onClick={() => setShowForm(false)} aria-label="Close registration dialog">×</button>
            </div>
            <form onSubmit={handleCreate} className="form-grid">
              <div className="field"><label htmlFor="doctor-full-name">Full name</label><input id="doctor-full-name" className="input" name="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
              <div className="field"><label htmlFor="doctor-email">Email</label><input id="doctor-email" className="input" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="field"><label htmlFor="doctor-password">Temporary password</label><input id="doctor-password" className="input" type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
              <div className="field"><label htmlFor="doctor-specialization">Specialization</label><input id="doctor-specialization" className="input" name="specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
              <div className="field"><label htmlFor="doctor-license">Medical license</label><input id="doctor-license" className="input" name="licenseNumber" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></div>
              <div className="field"><label htmlFor="doctor-department">Department</label><input id="doctor-department" className="input" name="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div className="field"><label htmlFor="doctor-role">Professional role</label><select id="doctor-role" className="select" name="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="SENIOR_CONSULTANT">Senior Consultant</option><option value="JUNIOR_DOCTOR">Junior Doctor</option><option value="RESIDENT">Resident</option><option value="READ_ONLY">Read Only</option></select></div>
              <div className="field"><label htmlFor="doctor-start">Working hours — start</label><input id="doctor-start" className="input" type="time" name="workingHoursStart" value={form.workingHoursStart} onChange={(e) => setForm({ ...form, workingHoursStart: e.target.value })} /></div>
              <div className="field"><label htmlFor="doctor-end">Working hours — end</label><input id="doctor-end" className="input" type="time" name="workingHoursEnd" value={form.workingHoursEnd} onChange={(e) => setForm({ ...form, workingHoursEnd: e.target.value })} /></div>
              <div className="field full"><div className="form-note">The form submits the existing doctor payload, including professional role and working hours.</div><div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={loading}>{loading ? "Creating doctor…" : "Create doctor"}</button></div></div>
            </form>
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default DoctorManagement;
