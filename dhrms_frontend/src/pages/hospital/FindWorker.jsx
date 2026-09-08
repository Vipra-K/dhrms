import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { lookupWorkerByPhone, addWorkerToHospital } from "../../services/workerService";
import { getHospitalDoctors } from "../../services/doctorService";
import { startEncounter } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const relationshipCopy = {
  ACTIVE: { label: "Hospital relationship active", tone: "status-active" },
  AVAILABLE: { label: "Ready to add to hospital", tone: "status-inactive" },
  OTHER_HOSPITAL: { label: "Associated with another hospital", tone: "status-suspended" },
};

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
    setDoctors((doctorList || []).filter((doctor) => doctor.status === "ACTIVE" && doctor.role !== "READ_ONLY"));
  };

  const handleSearch = async (event) => {
    event.preventDefault(); setError(""); setSuccess(""); setWorker(null); setDoctorId(""); setDoctors([]);
    const phone = value.trim().replace(/[\s-]/g, "");
    if (!phone) { setError("Enter the worker's registered phone number."); return; }
    if (!/^\+?[0-9]{10,15}$/.test(phone)) { setError("Enter a valid phone number with 10 to 15 digits."); return; }
    setLoading(true);
    try {
      const result = await lookupWorkerByPhone(phone);
      setWorker(result);
      if (result.hospitalRelationshipStatus === "ACTIVE") await loadDoctors();
    } catch (err) {
      setError(getApiError(err, "No worker was found with that phone number."));
    } finally { setLoading(false); }
  };

  const handleAddToHospital = async () => {
    if (!worker) return;
    setAdding(true); setError(""); setSuccess("");
    try {
      await addWorkerToHospital(worker.id);
      setWorker((current) => current ? { ...current, hospitalRelationshipStatus: "ACTIVE" } : current);
      await loadDoctors();
      setSuccess("Worker added to this hospital. Choose a doctor to continue.");
    } catch (err) { setError(getApiError(err, "Unable to add the worker to this hospital.")); }
    finally { setAdding(false); }
  };

  const handleStartVisit = async () => {
    if (!worker || worker.hospitalRelationshipStatus !== "ACTIVE" || !doctorId) { setError("Select the doctor handling this visit before continuing."); return; }
    setStarting(true); setError(""); setSuccess("");
    try {
      await startEncounter(worker.id, doctorId);
      setSuccess("Visit started successfully.");
      setTimeout(() => navigate("/hospital/workers"), 700);
    } catch (err) { setError(getApiError(err, "Unable to start the visit.")); }
    finally { setStarting(false); }
  };

  const relationship = worker?.hospitalRelationshipStatus;
  const relationshipMeta = relationshipCopy[relationship] || { label: relationship || "Relationship unavailable", tone: "status-inactive" };

  return (
    <RoleLayout
      title="Find worker"
      description="Identify a worker by registered phone number. Their hospital relationship is checked before clinical care begins."
      actions={[{ label: "Scan QR instead", onClick: () => navigate("/hospital/workers/scan"), variant: "secondary" }, { label: "Workers", onClick: () => navigate("/hospital/manage-workers"), variant: "secondary" }]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      {success && <div className="alert success" role="status">{success}</div>}

      <div className="scanner-layout">
        <section className="panel scanner-panel">
          <div className="panel-heading"><div><span className="eyebrow">Worker lookup</span><h2>Search by phone</h2><p>Use the phone number already registered to the worker. No new worker record is created by a lookup.</p></div></div>
          <form onSubmit={handleSearch}>
            <div className="field"><label htmlFor="worker-phone">Registered phone number</label><div style={{ display: "flex", gap: "8px" }}><input id="worker-phone" className="input" type="tel" inputMode="tel" value={value} onChange={(e) => setValue(e.target.value)} placeholder="9000000000" autoComplete="tel" style={{ flex: 1 }} /><button type="submit" className="button button-primary" disabled={loading}>{loading ? "Searching…" : "Find worker"}</button></div></div>
          </form>

          {worker && (
            <div style={{ marginTop: "22px" }}>
              <div className="panel-heading"><div><span className="eyebrow">Worker identified</span><h2>Review the relationship</h2><p>Hospital membership and the current visit are separate steps.</p></div></div>
              <div className="scan-success">
                <span className={`status-badge ${relationshipMeta.tone}`}>{relationshipMeta.label}</span>
                <div className="scan-person"><span className="avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span><div><h3>{worker.fullName || "Worker"}</h3><p>{worker.workerCode || "Worker record"}</p></div></div>
                <div className="scan-details"><span><small>Phone</small><strong>{worker.phone || "—"}</strong></span><span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span></div>
              </div>

              {relationship === "AVAILABLE" && <div className="panel" style={{ marginTop: "12px" }}><span className="eyebrow">Step 2</span><h3>Add to this hospital</h3><p>Establishing the hospital relationship does not assign a doctor and does not start a visit.</p><button type="button" className="button button-primary" onClick={handleAddToHospital} disabled={adding}>{adding ? "Adding…" : "Add to hospital"}</button></div>}
              {relationship === "OTHER_HOSPITAL" && <div className="alert error" style={{ marginTop: "12px" }}>This worker is currently associated with another hospital. That hospital must end its relationship before this worker can be added here.</div>}

              {relationship === "ACTIVE" && <div className="panel" style={{ marginTop: "12px" }}><span className="eyebrow">Step 3</span><h3>Start the visit</h3><div className="field" style={{ marginTop: "12px" }}><label htmlFor="doctor">Clinical doctor</label><select id="doctor" className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}><option value="">Select an active doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}</option>)}</select></div>{doctors.length === 0 && <div className="alert error" style={{ marginTop: "12px" }}>No active clinical doctor is available at this hospital.</div>}<div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => { setWorker(null); setValue(""); setSuccess(""); }}>New search</button><button type="button" className="button button-primary" onClick={handleStartVisit} disabled={starting || !doctorId || doctors.length === 0}>{starting ? "Starting visit…" : "Start visit"}</button></div></div>}
            </div>
          )}
        </section>

        <aside className="card scanner-help"><span className="eyebrow">Hospital workflow</span><h3>Three clear states</h3><ol><li><strong>Identify.</strong> Find the worker by phone or scan the permanent QR.</li><li><strong>Associate.</strong> Add the worker to this hospital when their relationship is available.</li><li><strong>Care.</strong> Pick an active doctor and start the encounter.</li></ol></aside>
      </div>
    </RoleLayout>
  );
};

export default FindWorker;
