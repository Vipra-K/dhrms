import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getDoctor } from "../../services/doctorService";

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getDoctor(doctorId)
      .then((data) => { if (!ignore) setDoctor(data); })
      .catch((err) => { if (!ignore) setError(err.response?.data?.error || "Unable to load doctor profile."); });
    return () => { ignore = true; };
  }, [doctorId]);

  return (
    <RoleLayout
      title="Doctor profile"
      description="View the clinician details registered with this hospital."
      actions={[{ label: "Back to doctors", onClick: () => navigate("/hospital/doctors"), variant: "secondary" }]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      {!doctor && !error && <div className="loading-card">Loading doctor profile…</div>}
      {doctor && (
        <>
          <section className="card worker-profile-header">
            <div className="person-cell"><span className="avatar">{(doctor.fullName || "D").charAt(0).toUpperCase()}</span><div><span className="eyebrow">Clinical profile</span><h2>{doctor.fullName}</h2><p>{doctor.email || "No email available"}</p></div></div>
            <span className={`status-badge ${doctor.status === "ACTIVE" ? "status-active" : doctor.status === "SUSPENDED" ? "status-suspended" : "status-inactive"}`}>{doctor.status || "UNKNOWN"}</span>
          </section>

          <section className="card">
            <div className="section-toolbar"><div><span className="eyebrow">Professional details</span><h2>Registration information</h2><p>Details used by the hospital to identify and assign this clinician.</p></div></div>
            <div className="profile-grid">
              <div><small>Specialization</small><strong>{doctor.specialization || "—"}</strong></div>
              <div><small>Department</small><strong>{doctor.department || "—"}</strong></div>
              <div><small>Medical license</small><strong>{doctor.licenseNumber || "—"}</strong></div>
              <div><small>Professional role</small><strong>{doctor.role?.replaceAll("_", " ") || "—"}</strong></div>
              <div><small>Working hours</small><strong>{doctor.workingHoursStart && doctor.workingHoursEnd ? `${doctor.workingHoursStart}–${doctor.workingHoursEnd}` : "—"}</strong></div>
              <div><small>Account status</small><strong>{doctor.status || "—"}</strong></div>
            </div>
          </section>

          <div className="dashboard-note"><strong>Account actions live in Doctors.</strong><span>Use the Doctors directory to activate, suspend, or deactivate this clinician.</span></div>
        </>
      )}
    </RoleLayout>
  );
};

export default DoctorProfile;
