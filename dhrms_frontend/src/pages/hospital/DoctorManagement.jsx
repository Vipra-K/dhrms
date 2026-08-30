import { useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import {
  getDoctors,
  createDoctor,
  suspendDoctor,
  activateDoctor,
  deactivateDoctor,
} from "../../services/doctorService";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    licenseNumber: "",
    department: "",
    role: "JUNIOR_DOCTOR",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load doctors");
    }
  };

  useEffect(() => {
    loadDoctors();
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
      await createDoctor(form);
      setForm({
        fullName: "",
        email: "",
        password: "",
        specialization: "",
        licenseNumber: "",
        department: "",
        role: "JUNIOR_DOCTOR",
      });
      await loadDoctors();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    await suspendDoctor(id);
    await loadDoctors();
  };

  const handleActivate = async (id) => {
    await activateDoctor(id);
    await loadDoctors();
  };

  const handleDeactivate = async (id) => {
    await deactivateDoctor(id);
    await loadDoctors();
  };

  return (
    <RoleLayout
      title="Doctor Management"
      description="Register and manage doctors within your hospital."
    >
      {error && <div className="alert error">{error}</div>}

      <div className="panel">
        <h2>Create Doctor</h2>
        <form onSubmit={handleCreate} className="form-grid">
          <div className="field">
            <label>Full Name</label>
            <input className="input" name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Specialization</label>
            <input className="input" name="specialization" value={form.specialization} onChange={handleChange} />
          </div>

          <div className="field">
            <label>License Number</label>
            <input className="input" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Department</label>
            <input className="input" name="department" value={form.department} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Role</label>
            <select className="select" name="role" value={form.role} onChange={handleChange}>
              <option value="SENIOR_CONSULTANT">Senior Consultant</option>
              <option value="JUNIOR_DOCTOR">Junior Doctor</option>
              <option value="RESIDENT">Resident</option>
              <option value="READ_ONLY">Read Only</option>
            </select>
          </div>

          <div className="field full">
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Doctor"}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <h2>Doctors List</h2>

        {doctors.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-state-title">No doctors found.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>License</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.fullName}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.licenseNumber}</td>
                    <td>{doctor.role}</td>
                    <td>
                      <span className={`status-badge ${
                        doctor.status === 'ACTIVE' ? 'status-active' : 
                        doctor.status === 'SUSPENDED' ? 'status-suspended' : 'status-inactive'
                      }`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {doctor.status === "ACTIVE" && (
                          <button className="button button-secondary text-xs" onClick={() => handleSuspend(doctor.id)}>Suspend</button>
                        )}
                        {doctor.status === "SUSPENDED" && (
                          <button className="button button-secondary text-xs" onClick={() => handleActivate(doctor.id)}>Activate</button>
                        )}
                        {doctor.status !== "INACTIVE" && (
                          <button className="button button-ghost text-xs" onClick={() => handleDeactivate(doctor.id)}>Deactivate</button>
                        )}
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

export default DoctorManagement;
