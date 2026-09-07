import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { lookupWorkerByQr } from "../../services/workerService";

const WorkerQrScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);

  const startScanner = () => {
    setError("");
    setWorker(null);
    setScanning(true);
    const scanner = new Html5QrcodeScanner("worker-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scannerRef.current = scanner;
    const onScanSuccess = async (decodedText) => {
      try {
        await scanner.clear();
        scannerRef.current = null;
        const workerData = await lookupWorkerByQr(decodedText);
        setScanning(false);
        setWorker(workerData);
      } catch (err) {
        setScanning(false);
        setError(getApiError(err, "Invalid or expired worker QR code."));
      }
    };
    scanner.render(onScanSuccess, () => {});
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("worker-qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scannerRef.current = scanner;
    const onScanSuccess = async (decodedText) => {
      try {
        await scanner.clear();
        scannerRef.current = null;
        const workerData = await lookupWorkerByQr(decodedText);
        setScanning(false);
        setWorker(workerData);
      } catch (err) {
        setScanning(false);
        setError(getApiError(err, "Invalid or expired worker QR code."));
      }
    };
    scanner.render(onScanSuccess, () => {});

    return () => {
      scannerRef.current = null;
      scanner.clear().catch(() => {});
    };
  }, []);

  return <RoleLayout title="Scan Worker QR" description="Scan a worker's DHRMS identity to quickly open their profile.">
    {error && <div className="alert error" role="alert">{error}</div>}
    <div className="scanner-layout">
      <div className="panel scanner-panel">
        <div className="panel-heading"><div><h2>Worker QR scanner</h2><p>Allow camera access and place the QR code inside the frame.</p></div></div>
        {!worker ? <div id="worker-qr-reader" className="qr-reader" aria-busy={scanning} /> : <div className="scan-success">
          <span className="status-badge status-active">Worker found</span>
          <div className="scan-person"><span className="avatar">{(worker.fullName || "W").charAt(0)}</span><div><h3>{worker.fullName}</h3><p>{worker.workerCode}</p></div></div>
          <div className="scan-details"><span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span><span><small>Phone</small><strong>{worker.phone || "—"}</strong></span><span><small>Date of birth</small><strong>{worker.dateOfBirth ? String(worker.dateOfBirth).slice(0, 10) : "—"}</strong></span></div>
          <div className="modal-actions"><button className="button button-secondary" onClick={startScanner}>Scan another</button><button className="button button-primary" onClick={() => navigate(`/hospital/workers/${worker.id}`)}>Open worker profile</button></div>
        </div>}
      </div>
      <aside className="card scanner-help"><span className="eyebrow">Quick guide</span><h3>Identify a worker</h3><ol><li>Ask the worker to show their DHRMS QR card.</li><li>Hold the QR code steady inside the frame.</li><li>Review the worker identity before opening the profile.</li></ol><p>Only use worker information for the care and administrative workflow you are authorized to perform.</p></aside>
    </div>
  </RoleLayout>;
};
export default WorkerQrScanner;
