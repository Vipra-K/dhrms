import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { lookupWorkerByQr } from "../../services/workerService";
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
  const [starting, setStarting] = useState(false);

  const handleScan = async (decodedText, scanner) => {
    try {
      await scanner.clear();
      scannerRef.current = null;
      setError("");
      const [workerData, doctorData] = await Promise.all([lookupWorkerByQr(decodedText), getHospitalDoctors()]);
      setWorker(workerData);
      setDoctors((doctorData || []).filter((doctor) => doctor.status === "ACTIVE" && doctor.role !== "READ_ONLY"));
      setScanning(false);
    } catch (err) {
      setScanning(false);
      setError(getApiError(err, "Invalid or expired worker QR code."));
    }
  };

  const startScanner = () => {
    setError(""); setWorker(null); setDoctorId(""); setScanning(true);
    const scanner = new Html5QrcodeScanner("worker-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scannerRef.current = scanner;
    scanner.render((decodedText) => handleScan(decodedText, scanner), () => {});
  };

  useEffect(() => {
    startScanner();
    return () => { scannerRef.current?.clear().catch(() => {}); scannerRef.current = null; };
  }, []);

  const handleStartVisit = async () => {
    if (!worker || !doctorId) { setError("Select the doctor who will handle this visit."); return; }
    setStarting(true); setError("");
    try {
      const encounter = await startEncounter(worker.id, doctorId);
      navigate(`/doctor/encounters/${encounter.id}`, { replace: true });
    } catch (err) {
      setError(getApiError(err, "Unable to start the visit."));
    } finally { setStarting(false); }
  };

  return <RoleLayout title="Start a worker visit" description="Identify the worker, verify the identity, and create a temporary healthcare encounter.">
    {error && <div className="alert error" role="alert">{error}</div>}
    <div className="scanner-layout">
      <div className="panel scanner-panel">
        {!worker ? <><div className="panel-heading"><div><span className="eyebrow">Step 1</span><h2>Scan worker QR</h2><p>Ask the worker to show their DHRMS QR card and place it inside the frame.</p></div></div><div id="worker-qr-reader" className="qr-reader" aria-busy={scanning} /></> : <>
          <div className="panel-heading"><div><span className="eyebrow">Step 2</span><h2>Confirm worker</h2><p>This identifies the worker; it does not permanently connect them to this hospital.</p></div></div>
          <div className="scan-success"><span className="status-badge status-active">Verified worker</span><div className="scan-person"><span className="avatar">{(worker.fullName || "W").charAt(0)}</span><div><h3>{worker.fullName}</h3><p>{worker.workerCode}</p></div></div><div className="scan-details"><span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span><span><small>Phone</small><strong>{worker.phone || "—"}</strong></span><span><small>Date of birth</small><strong>{worker.dateOfBirth ? String(worker.dateOfBirth).slice(0, 10) : "—"}</strong></span></div></div>
          <div className="field"><label htmlFor="doctor">Doctor for this visit</label><select id="doctor" className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}><option value="">Select an active doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}</option>)}</select></div>
          {doctors.length === 0 && <div className="alert error">No active clinical doctor is available at this hospital. Add or activate a doctor before starting the visit.</div>}
          <div className="modal-actions"><button className="button button-secondary" onClick={startScanner}>Scan another</button><button className="button button-primary" onClick={handleStartVisit} disabled={starting || !doctorId || doctors.length === 0}>{starting ? "Starting visit…" : "Start visit"}</button></div>
        </>}
      </div>
      <aside className="card scanner-help"><span className="eyebrow">How it works</span><h3>A visit, not a permanent assignment</h3><ol><li>Scan the worker's permanent DHRMS QR.</li><li>Select the doctor handling this consultation.</li><li>The encounter becomes active for this visit only.</li><li>The doctor completes it when care is finished.</li></ol><p>The worker can later visit another hospital or doctor without being transferred or permanently assigned.</p></aside>
    </div>
  </RoleLayout>;
};
export default WorkerQrScanner;
