import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getDoctor } from "../../services/doctorService";

const DoctorProfile = () => {
  const { doctorId } = useParams(); const navigate = useNavigate(); const [doctor, setDoctor] = useState(null); const [error, setError] = useState("");
  useEffect(() => { getDoctor(doctorId).then(setDoctor).catch((err) => setError(err.response?.data?.error || "Unable to load doctor.")); }, [doctorId]);
  return <RoleLayout title="Doctor profile" description="View the clinician details registered with your hospital.">
    {error && <div className="alert error">{error}</div>}
    {!doctor && !error ? <div className="loading-card">Loading doctor profile...</div> : doctor && <div className="card-row"><div className="panel"><div className="person-cell"><span className="avatar">{(doctor.fullName || "D").charAt(0)}</span><div><h2>{doctor.fullName}</h2><p>{doctor.email}</p></div></div><div className="profile-grid"><div><small>Specialization</small><strong>{doctor.specialization || "—"}</strong></div><div><small>Department</small><strong>{doctor.department || "—"}</strong></div><div><small>License</small><strong>{doctor.licenseNumber || "—"}</strong></div><div><small>Role</small><strong>{doctor.role?.replaceAll("_", " ") || "—"}</strong></div><div><small>Working hours</small><strong>{doctor.workingHoursStart && doctor.workingHoursEnd ? `${doctor.workingHoursStart}–${doctor.workingHoursEnd}` : "—"}</strong></div><div><small>Status</small><strong>{doctor.status || "—"}</strong></div></div></div><div className="card"><span className="eyebrow">Account</span><h3>Doctor management</h3><p>Use the Doctors directory to activate, suspend or deactivate this account.</p><button className="button button-secondary" onClick={() => navigate("/hospital/doctors")}>Back to doctors</button></div></div>}
  </RoleLayout>;
};
export default DoctorProfile;
