import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { lookupWorkerByPhone, addWorkerToHospital } from "../../services/workerService";
import { getHospitalDoctors } from "../../services/doctorService";
import { startEncounter } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const FindWorker = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [worker, setWorker] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [starting, setStarting] = useState(false);

  const loadDoctors = async () => {
    const doctorList = await getHospitalDoctors();
    setDoctors((doctorList || []).filter((d) => d.status === "ACTIVE" && d.role !== "READ_ONLY"));
  };

  const handleSearch = async (event) => {
    event.preventDefault(); setError(""); setSuccess(""); setWorker(null); setDoctorId(""); setDoctors([]);
    const phone = value.trim().replace(/[\s-]/g, "");
    if (!phone) { setError("Please enter the worker's phone number."); return; }
    if (!/^\+?[0-9]{10,15}$/.test(phone)) { setError("Please enter a valid phone number (10 to 15 digits)."); return; }
    setLoading(true);
    try {
      const result = await lookupWorkerByPhone(phone);
      setWorker(result);
      if (result.hospitalRelationshipStatus === "ACTIVE") await loadDoctors();
    } catch (err) { setError(getApiError(err, "Worker not found with the provided phone number.")); }
    finally { setLoading(false); }
  };

  const handleAddToHospital = async () => {
    if (!worker) return;
    setAdding(true); setError(""); setSuccess("");
    try {
      await addWorkerToHospital(worker.id);
      setWorker((current) => current ? { ...current, hospitalRelationshipStatus: "ACTIVE" } : current);
      await loadDoctors();
      setSuccess("Worker added to this hospital. You can now select a doctor and start the visit.");
    } catch (err) { setError(getApiError(err, "Unable to add the worker to this hospital.")); }
    finally { setAdding(false); }
  };

  const handleStartVisit = async () => {
    if (!worker || worker.hospitalRelationshipStatus !== "ACTIVE" || !doctorId) { setError("Add the worker to this hospital and select the doctor handling this visit."); return; }
    setStarting(true); setError(""); setSuccess("");
    try {
      await startEncounter(worker.id, doctorId);
      // Hospital users must remain in hospital-scoped routes. The doctor owns the clinical encounter UI.
      setSuccess("Visit started successfully. The worker has been assigned to the selected doctor.");
      setTimeout(() => navigate("/hospital/active-visits"), 700);
    }
    catch (err) { setError(getApiError(err, "Unable to start the visit.")); }
    finally { setStarting(false); }
  };

  const relationship = worker?.hospitalRelationshipStatus;

  return <RoleLayout title="Find Worker" description="Identify a worker by phone number, then add them to this hospital before starting a visit." actions={[{ label: "Scan Worker QR", onClick: () => navigate("/hospital/workers/scan"), variant: "secondary" }]}>
    {error && <div className="alert error" role="alert">{error}</div>}
    {success && <div className="alert success" role="status">{success}</div>}
    <div className="scanner-layout">
      <div className="panel scanner-panel">
        <div className="panel-heading"><div><span className="eyebrow">Step 1</span><h2>Find worker</h2><p>Use the worker's registered phone number. QR scanning is also available.</p></div></div>
        <form onSubmit={handleSearch}><div className="field"><label htmlFor="worker-phone">Phone Number</label><div style={{ display: "flex", gap: "0.5rem" }}><input id="worker-phone" className="input" type="tel" inputMode="tel" value={value} onChange={(e) => setValue(e.target.value)} placeholder="9000000000" autoComplete="tel" style={{ flex: 1 }} /><button type="submit" className="button button-primary" disabled={loading}>{loading ? "Searching…" : "Find Worker"}</button></div></div></form>

        {worker && <div style={{ marginTop: "1.5rem" }}>
          <div className="panel-heading"><div><span className="eyebrow">Step 2</span><h2>Worker identified</h2><p>Hospital membership is separate from the doctor's visit.</p></div></div>
          <div className="scan-success"><span className={`status-badge ${relationship === "ACTIVE" ? "status-active" : "status-inactive"}`}>{relationship === "ACTIVE" ? "Hospital relationship active" : relationship === "AVAILABLE" ? "Not yet associated with this hospital" : "Associated with another hospital"}</span><div className="scan-person"><span className="avatar">{(worker.fullName || "W").charAt(0)}</span><div><h3>{worker.fullName}</h3><p>{worker.workerCode}</p></div></div><div className="scan-details"><span><small>Phone</small><strong>{worker.phone || "—"}</strong></span><span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span></div></div>

          {relationship === "AVAILABLE" && <div className="panel" style={{ marginTop: "1rem" }}><h3>Add worker to this hospital</h3><p>This creates the hospital-worker relationship. It does not assign a doctor or start a visit.</p><button type="button" className="button button-primary" onClick={handleAddToHospital} disabled={adding}>{adding ? "Adding…" : "Add to hospital"}</button></div>}
          {relationship === "OTHER_HOSPITAL" && <div className="alert error" style={{ marginTop: "1rem" }}>This worker is currently associated with another hospital. That hospital must terminate its relationship before this worker can be added here.</div>}

          {relationship === "ACTIVE" && <><div className="field" style={{ marginTop: "1rem" }}><label htmlFor="doctor">Doctor for this visit</label><select id="doctor" className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}><option value="">Select an active doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}</option>)}</select></div>{doctors.length === 0 && <div className="alert error">No active clinical doctor is available at this hospital.</div>}<div className="modal-actions" style={{ marginTop: "1rem" }}><button type="button" className="button button-secondary" onClick={() => { setWorker(null); setValue(""); setSuccess(""); }}>Clear</button><button type="button" className="button button-primary" onClick={handleStartVisit} disabled={starting || !doctorId || doctors.length === 0}>{starting ? "Starting visit…" : "Start visit"}</button></div></>}
        </div>}
      </div>
      <aside className="card scanner-help"><span className="eyebrow">Hospital workflow</span><h3>Relationship first, visit second</h3><ol><li>Find the worker by phone or scan their QR.</li><li>If they are not associated with this hospital, click <strong>Add to hospital</strong>.</li><li>Select the doctor handling the current visit.</li><li>Start the encounter. Completing the visit will end only the doctor relationship.</li></ol></aside>
    </div>
  </RoleLayout>;
};
export default FindWorker;
