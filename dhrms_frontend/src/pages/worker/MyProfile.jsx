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
        if (!ignore) {
          setWorker(data);
          setForm(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiError(err, "Failed to load profile."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateMyWorkerProfile(form);
      setWorker((current) => ({ ...current, ...updated }));
      setForm((current) => ({ ...current, ...updated }));
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(getApiError(err, "Unable to update profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <RoleLayout title="My Profile"><div className="loading-card">Loading profile…</div></RoleLayout>;
  if (!worker) return <RoleLayout title="My Profile"><div className="alert error">{error || "Profile not found."}</div></RoleLayout>;

  return <RoleLayout title="My Profile" description="Keep your personal and emergency contact details up to date.">
    {(error || success) && <div className={`alert ${error ? "error" : "success"}`}>{error || success}</div>}
    <div className="panel">
      <div className="section-toolbar"><div><span className="eyebrow">Worker identity</span><h2>{worker.fullName}</h2><p>{worker.workerCode}</p></div>{!editing && <button className="button button-primary" onClick={() => { setError(""); setSuccess(""); setForm(worker); setEditing(true); }}>Edit profile</button>}</div>
      {editing ? <form className="form-grid" onSubmit={save}>{fields.map(([key, label, type]) => <div className="field" key={key}><label>{label}</label><input className="input" type={type} value={key === "dateOfBirth" ? String(form[key] || "").slice(0, 10) : form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} disabled={key === "fullName"} /></div>)}<div className="field full"><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setEditing(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div></div></form> : <div className="record-fields">{fields.map(([key, label]) => <div key={key}><small>{label}</small><p>{key === "dateOfBirth" ? String(worker[key] || "").slice(0, 10) || "—" : worker[key] || "—"}</p></div>)}</div>}
    </div>
  </RoleLayout>;
};

export default MyProfile;
