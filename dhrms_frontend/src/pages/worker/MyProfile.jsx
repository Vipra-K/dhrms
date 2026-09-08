import { useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { getMyWorkerProfile, updateMyWorkerProfile } from "../../services/workerService";

const fields = [
  ["fullName", "Full name", "text"],
  ["dateOfBirth", "Date of birth", "date"],
  ["gender", "Gender", "text"],
  ["bloodGroup", "Blood group", "text"],
  ["phone", "Phone", "tel"],
  ["address", "Address", "text"],
  ["emergencyContactName", "Emergency contact", "text"],
  ["emergencyContactPhone", "Emergency phone", "tel"],
  ["emergencyContactRelation", "Relationship", "text"],
];

const MyProfile = () => {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchProfile = async () => {
      try {
        const data = await getMyWorkerProfile();
        if (!ignore) { setWorker(data); setForm(data); }
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Unable to load your profile."));
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProfile();
    return () => { ignore = true; };
  }, []);

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const updated = await updateMyWorkerProfile(form);
      setWorker((current) => ({ ...current, ...updated })); setForm((current) => ({ ...current, ...updated })); setEditing(false); setSuccess("Your profile has been updated.");
    } catch (err) { setError(getApiError(err, "Unable to update your profile.")); }
    finally { setSaving(false); }
  };

  if (loading) return <RoleLayout title="Profile"><div className="loading-card">Loading your profile…</div></RoleLayout>;
  if (!worker) return <RoleLayout title="Profile"><div className="alert error">{error || "Your worker profile could not be found."}</div></RoleLayout>;

  return (
    <RoleLayout title="Personal profile" description="Review the personal and emergency information associated with your verified worker identity.">
      {(error || success) && <div className={`alert ${error ? "error" : "success"}`} role="alert">{error || success}</div>}
      <div className="worker-profile-layout">
        <aside className="panel worker-profile-summary">
          <div className="worker-profile-avatar">{worker.fullName?.charAt(0)?.toUpperCase() || "W"}</div>
          <span className="eyebrow">Verified worker</span>
          <h2>{worker.fullName}</h2>
          <p>{worker.workerCode || "Worker ID unavailable"}</p>
          <span className={`worker-profile-status ${worker.active ? "is-active" : "is-inactive"}`}><i aria-hidden="true" /> {worker.active ? "Active identity" : "Inactive identity"}</span>
          <div className="worker-profile-note"><strong>Clinical records are protected</strong><span>Your profile information is separate from your clinical history. Changes are recorded through your DHRMS account.</span></div>
        </aside>
        <section className="panel worker-profile-panel">
          <div className="section-toolbar"><div><span className="eyebrow">Personal information</span><h2>{editing ? "Update your details" : "Your information"}</h2><p>{editing ? "Only information available to your worker account can be changed." : "Keep your contact information current so authorized staff can reach you when required."}</p></div>{!editing && <button className="button button-primary" type="button" onClick={() => { setError(""); setSuccess(""); setForm(worker); setEditing(true); }}>Edit profile</button>}</div>
          {editing ? (
            <form className="form-grid worker-profile-form" onSubmit={save}>
              {fields.map(([key, label, type]) => <div className={`field ${key === "address" ? "full" : ""}`} key={key}><label htmlFor={`worker-${key}`}>{label}</label><input id={`worker-${key}`} className="input" type={type} value={key === "dateOfBirth" ? String(form[key] || "").slice(0, 10) : form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} disabled={key === "fullName"} /></div>)}
              <div className="field full"><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => { setEditing(false); setForm(worker); }}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div></div>
            </form>
          ) : (
            <div className="worker-profile-groups">
              <section><h3>Personal details</h3><div className="record-fields">{fields.slice(0, 6).map(([key, label]) => <div key={key}><small>{label}</small><p>{key === "dateOfBirth" ? String(worker[key] || "").slice(0, 10) || "—" : worker[key] || "—"}</p></div>)}</div></section>
              <section><h3>Emergency contact</h3><div className="record-fields">{fields.slice(6).map(([key, label]) => <div key={key}><small>{label}</small><p>{worker[key] || "—"}</p></div>)}</div></section>
            </div>
          )}
        </section>
      </div>
    </RoleLayout>
  );
};

export default MyProfile;
