import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { lookupWorkerByQr, addWorkerToHospital } from "../../services/workerService";
import { getHospitalDoctors } from "../../services/doctorService";
import { startEncounter } from "../../services/encounterService";

const WorkerQrScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [worker, setWorker] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [adding, setAdding] = useState(false);
  const [starting, setStarting] = useState(false);

  const loadDoctors = async () => {
    const data = await getHospitalDoctors();
    setDoctors((data || []).filter((doctor) => doctor.status === "ACTIVE" && doctor.role !== "READ_ONLY"));
  };

  const handleScan = async (decodedText, scanner) => {
    try {
      await scanner.clear();
      scannerRef.current = null;
      setError("");
      const workerData = await lookupWorkerByQr(decodedText);
      setWorker(workerData);
      setDoctorId("");
      if (workerData.hospitalRelationshipStatus === "ACTIVE") await loadDoctors();
      setScanning(false);
    } catch (err) {
      setScanning(false);
      setError(getApiError(err, "Invalid or expired worker QR code."));
    }
  };

  const startScanner = () => {
    setError(""); setWorker(null); setDoctorId(""); setDoctors([]); setScanning(true);
    const scanner = new Html5QrcodeScanner("worker-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scannerRef.current = scanner;
    scanner.render((decodedText) => handleScan(decodedText, scanner), () => {});
  };

  useEffect(() => {
    startScanner();
    return () => { scannerRef.current?.clear().catch(() => {}); scannerRef.current = null; };
  }, []);

  const handleAddToHospital = async () => {
    if (!worker) return;
    setAdding(true); setError("");
    try {
      await addWorkerToHospital(worker.id);
      setWorker((current) => ({ ...current, hospitalRelationshipStatus: "ACTIVE" }));
      await loadDoctors();
    } catch (err) { setError(getApiError(err, "Unable to add the worker to this hospital.")); }
    finally { setAdding(false); }
  };

  const handleStartVisit = async () => {
    if (!worker || worker.hospitalRelationshipStatus !== "ACTIVE" || !doctorId) { setError("Add the worker to this hospital and select the doctor handling this visit."); return; }
    setStarting(true); setError("");
    try {
      const encounter = await startEncounter(worker.id, doctorId);
      navigate(`/doctor/encounters/${encounter.id}`, { replace: true });
    } catch (err) { setError(getApiError(err, "Unable to start the visit.")); }
    finally { setStarting(false); }
  };

  const relationship = worker?.hospitalRelationshipStatus;
  const relationshipLabel = relationship === "ACTIVE" ? "Hospital relationship active" : relationship === "AVAILABLE" ? "Ready to add to hospital" : relationship === "OTHER_HOSPITAL" ? "Associated with another hospital" : relationship;
  const relationshipTone = relationship === "ACTIVE" ? "status-active" : relationship === "OTHER_HOSPITAL" ? "status-suspended" : "status-inactive";

  return (
    <RoleLayout
      title="Start a worker visit"
      description="Scan the worker's permanent QR, confirm the hospital relationship, and start care with an active doctor."
      actions={[{ label: "Find by phone", onClick: () => navigate("/hospital/find-worker"), variant: "secondary" }]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="scanner-layout">
        <section className="panel scanner-panel">
          {!worker ? (
            <>
              <div className="panel-heading"><div><span className="eyebrow">Step 1 · Identify</span><h2>Scan worker QR</h2><p>Ask the worker to show their DHRMS QR card to the camera.</p></div></div>
              <div id="worker-qr-reader" className="qr-reader" aria-busy={scanning} />
              <div style={{ marginTop: "14px", textAlign: "center" }}><button type="button" className="button button-secondary" onClick={() => navigate("/hospital/find-worker")}>Use phone lookup instead</button></div>
            </>
          ) : (
            <>
              <div className="panel-heading"><div><span className="eyebrow">Worker identified</span><h2>Review before care</h2><p>The scan identifies the worker; the next step depends on their hospital relationship.</p></div></div>
              <div className="scan-success"><span className={`status-badge ${relationshipTone}`}>{relationshipLabel}</span><div className="scan-person"><span className="avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span><div><h3>{worker.fullName || "Worker"}</h3><p>{worker.workerCode || "Worker record"}</p></div></div><div className="scan-details"><span><small>Phone</small><strong>{worker.phone || "—"}</strong></span><span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span></div></div>
              {relationship === "AVAILABLE" && <div className="panel" style={{ marginTop: "12px" }}><span className="eyebrow">Step 2 · Associate</span><h3>Add to this hospital</h3><p>This establishes the hospital relationship. It does not assign a doctor or start a visit.</p><button type="button" className="button button-primary" onClick={handleAddToHospital} disabled={adding}>{adding ? "Adding…" : "Add to hospital"}</button></div>}
              {relationship === "OTHER_HOSPITAL" && <div className="alert error" style={{ marginTop: "12px" }}>This worker is currently associated with another hospital. That hospital must end its relationship before this worker can be added here.</div>}
              {relationship === "ACTIVE" && <div className="panel" style={{ marginTop: "12px" }}><span className="eyebrow">Step 3 · Start care</span><h3>Choose the clinical doctor</h3><div className="field" style={{ marginTop: "12px" }}><label htmlFor="doctor">Active doctor</label><select id="doctor" className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}><option value="">Select an active doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}</option>)}</select></div>{doctors.length === 0 && <div className="alert error" style={{ marginTop: "12px" }}>No active clinical doctor is available at this hospital.</div>}<div className="modal-actions"><button className="button button-secondary" type="button" onClick={startScanner}>Scan another</button><button className="button button-primary" type="button" onClick={handleStartVisit} disabled={starting || !doctorId || doctors.length === 0}>{starting ? "Starting visit…" : "Start visit"}</button></div></div>}
            </>
          )}
        </section>
        <aside className="card scanner-help"><span className="eyebrow">Quick guide</span><h3>Identify → associate → care</h3><ol><li>Scan the worker's permanent QR.</li><li>Add the worker to this hospital only when the relationship is available.</li><li>Select an active clinical doctor and start the encounter.</li><li>Use Workers later when the hospital needs to end the relationship.</li></ol></aside>
      </div>
    </RoleLayout>
  );
};

export default WorkerQrScanner;
