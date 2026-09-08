import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { lookupWorkerByQr, addWorkerToHospital } from "../../services/workerService";
import { getHospitalDoctors } from "../../services/doctorService";
import { startEncounter } from "../../services/encounterService";

const WorkerQrScanner = () => {
  const navigate = useNavigate(); const scannerRef = useRef(null);
  const [worker, setWorker] = useState(null); const [doctors, setDoctors] = useState([]); const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState(""); const [scanning, setScanning] = useState(true); const [adding, setAdding] = useState(false); const [starting, setStarting] = useState(false);
  const loadDoctors = async () => { const data = await getHospitalDoctors(); setDoctors((data || []).filter((d) => d.status === "ACTIVE" && d.role !== "READ_ONLY")); };
  const handleScan = async (decodedText, scanner) => {
    try { await scanner.clear(); scannerRef.current = null; setError(""); const workerData = await lookupWorkerByQr(decodedText); setWorker(workerData); setDoctorId(""); if (workerData.hospitalRelationshipStatus === "ACTIVE") await loadDoctors(); setScanning(false); }
    catch (err) { setScanning(false); setError(getApiError(err, "Invalid or expired worker QR code.")); }
  };
  const startScanner = () => { setError(""); setWorker(null); setDoctorId(""); setDoctors([]); setScanning(true); const scanner = new Html5QrcodeScanner("worker-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false); scannerRef.current = scanner; scanner.render((decodedText) => handleScan(decodedText, scanner), () => {}); };
  useEffect(() => { startScanner(); return () => { scannerRef.current?.clear().catch(() => {}); scannerRef.current = null; }; }, []);
  const handleAddToHospital = async () => { if (!worker) return; setAdding(true); setError(""); try { await addWorkerToHospital(worker.id); setWorker((current) => ({ ...current, hospitalRelationshipStatus: "ACTIVE" })); await loadDoctors(); } catch (err) { setError(getApiError(err, "Unable to add the worker to this hospital.")); } finally { setAdding(false); } };
  const handleStartVisit = async () => { if (!worker || worker.hospitalRelationshipStatus !== "ACTIVE" || !doctorId) { setError("Add the worker to this hospital and select the doctor handling this visit."); return; } setStarting(true); setError(""); try { const encounter = await startEncounter(worker.id, doctorId); navigate(`/doctor/encounters/${encounter.id}`, { replace: true }); } catch (err) { setError(getApiError(err, "Unable to start the visit.")); } finally { setStarting(false); } };
  const relationship = worker?.hospitalRelationshipStatus;
  return <RoleLayout title="Start a worker visit" description="Identify the worker, establish the hospital relationship if needed, and create a temporary healthcare encounter." actions={[{ label: "Find by Phone", onClick: () => navigate("/hospital/find-worker"), variant: "secondary" }]}>
    {error && <div className="alert error" role="alert">{error}</div>}
    <div className="scanner-layout"><div className="panel scanner-panel">
      {!worker ? <><div className="panel-heading"><div><span className="eyebrow">Step 1</span><h2>Scan worker QR</h2><p>Ask the worker to show their DHRMS QR card.</p></div></div><div id="worker-qr-reader" className="qr-reader" aria-busy={scanning} /><div style={{ marginTop: "1rem", textAlign: "center" }}><button type="button" className="button button-secondary" onClick={() => navigate("/hospital/find-worker")}>Find worker by phone instead</button></div></> : <>
        <div className="panel-heading"><div><span className="eyebrow">Step 2</span><h2>Worker identified</h2><p>Hospital membership is separate from the doctor's visit.</p></div></div>
        <div className="scan-success"><span className={`status-badge ${relationship === "ACTIVE" ? "status-active" : "status-inactive"}`}>{relationship === "ACTIVE" ? "Hospital relationship active" : relationship === "AVAILABLE" ? "Not yet associated with this hospital" : "Associated with another hospital"}</span><div className="scan-person"><span className="avatar">{(worker.fullName || "W").charAt(0)}</span><div><h3>{worker.fullName}</h3><p>{worker.workerCode}</p></div></div><div className="scan-details"><span><small>Phone</small><strong>{worker.phone || "—"}</strong></span><span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span></div></div>
        {relationship === "AVAILABLE" && <div className="panel" style={{ marginTop: "1rem" }}><h3>Add worker to this hospital</h3><p>This establishes the hospital relationship. It does not assign a doctor or start a visit.</p><button type="button" className="button button-primary" onClick={handleAddToHospital} disabled={adding}>{adding ? "Adding…" : "Add to hospital"}</button></div>}
        {relationship === "OTHER_HOSPITAL" && <div className="alert error" style={{ marginTop: "1rem" }}>This worker is currently associated with another hospital. That hospital must terminate its relationship before this worker can be added here.</div>}
        {relationship === "ACTIVE" && <><div className="field"><label htmlFor="doctor">Doctor for this visit</label><select id="doctor" className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}><option value="">Select an active doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}</option>)}</select></div>{doctors.length === 0 && <div className="alert error">No active clinical doctor is available at this hospital.</div>}<div className="modal-actions"><button className="button button-secondary" onClick={startScanner}>Scan another</button><button className="button button-primary" onClick={handleStartVisit} disabled={starting || !doctorId || doctors.length === 0}>{starting ? "Starting visit…" : "Start visit"}</button></div></>}
      </>}
    </div><aside className="card scanner-help"><span className="eyebrow">Hospital workflow</span><h3>Relationship first, visit second</h3><ol><li>Scan the worker's permanent QR.</li><li>If needed, add the worker to this hospital.</li><li>Select the doctor for the current visit.</li><li>Completing the visit ends only the doctor relationship.</li></ol></aside></div>
  </RoleLayout>;
};
export default WorkerQrScanner;
