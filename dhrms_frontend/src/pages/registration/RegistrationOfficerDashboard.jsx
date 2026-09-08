import { useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { registerWorker } from "../../services/registrationService";
import { getApiError } from "../../services/api";

const initialForm = {
  fullName: "", dateOfBirth: "", gender: "", bloodGroup: "", phone: "", address: "",
  emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "",
  employerName: "", worksiteName: "", worksiteAddress: "", worksiteDistrict: "", jobRole: "",
  email: "", password: "",
};

const RegistrationOfficerDashboard = () => {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.email) delete payload.email;
      if (!payload.password) delete payload.password;
      const registered = await registerWorker(payload);
      setResult(registered);
      setForm(initialForm);
    } catch (err) {
      setError(getApiError(err, "Unable to register worker."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout
      title="Worker registration"
      description="Verify a migrant worker's identity and employment details before issuing a permanent DHRMS identity."
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      {result && (
        <div className="panel">
          <div className="panel-heading"><div><span className="eyebrow">Registration complete</span><h2>{result.workerCode}</h2><p>{result.fullName} now has a permanent DHRMS identity.</p></div></div>
          <div className="worker-id-card">
            <div className="id-card-brand">DHRMS <span>WORKER ID</span></div>
            {result.qrImage && <img src={result.qrImage} alt={`QR code for ${result.workerCode}`} />}
            <p>Give this QR card to the worker. Hospitals use it to identify the worker and start a visit.</p>
          </div>
          <div className="modal-actions"><button className="button button-primary" onClick={() => setResult(null)}>Register another worker</button></div>
        </div>
      )}

      {!result && <form onSubmit={submit} className="panel form-grid">
        <div className="field full"><div><span className="eyebrow">Identity</span><h2>Worker details</h2><p>Only register the worker after the required identity checks have been completed.</p></div></div>
        <div className="field"><label>Full name</label><input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required /></div>
        <div className="field"><label>Date of birth</label><input className="input" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></div>
        <div className="field"><label>Gender</label><select className="select" value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
        <div className="field"><label>Blood group</label><input className="input" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} /></div>
        <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div className="field full"><label>Address</label><input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>

        <div className="field full"><div><span className="eyebrow">Employment verification</span><h2>Worksite details</h2><p>These details establish why the worker is being registered as part of the migrant-worker program.</p></div></div>
        <div className="field"><label>Employer / contractor</label><input className="input" value={form.employerName} onChange={(e) => set("employerName", e.target.value)} /></div>
        <div className="field"><label>Job role</label><input className="input" value={form.jobRole} onChange={(e) => set("jobRole", e.target.value)} placeholder="e.g. Mason" /></div>
        <div className="field"><label>Worksite name</label><input className="input" value={form.worksiteName} onChange={(e) => set("worksiteName", e.target.value)} /></div>
        <div className="field"><label>Worksite district</label><input className="input" value={form.worksiteDistrict} onChange={(e) => set("worksiteDistrict", e.target.value)} /></div>
        <div className="field full"><label>Worksite address</label><input className="input" value={form.worksiteAddress} onChange={(e) => set("worksiteAddress", e.target.value)} /></div>

        <div className="field full"><div><span className="eyebrow">Emergency contact</span><h2>Safety information</h2></div></div>
        <div className="field"><label>Contact name</label><input className="input" value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} /></div>
        <div className="field"><label>Contact phone</label><input className="input" value={form.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} /></div>
        <div className="field"><label>Relationship</label><input className="input" value={form.emergencyContactRelation} onChange={(e) => set("emergencyContactRelation", e.target.value)} /></div>

        <div className="field full"><div><span className="eyebrow">Optional worker login</span><h2>Portal access</h2><p>Leave these blank if the worker will use the system through assisted access only.</p></div></div>
        <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="field"><label>Password</label><input className="input" type="password" minLength="6" value={form.password} onChange={(e) => set("password", e.target.value)} /></div>

        <div className="field full"><div className="modal-actions"><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Registering…" : "Verify & register worker"}</button></div></div>
      </form>}
    </RoleLayout>
  );
};

export default RegistrationOfficerDashboard;
