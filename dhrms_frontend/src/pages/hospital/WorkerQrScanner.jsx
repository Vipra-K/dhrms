import { useCallback, useEffect, useRef, useState } from "react";
import "./../hospital-pages.css";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { lookupWorkerByQr, addWorkerToHospital } from "../../services/workerService";
import { getHospitalDoctors } from "../../services/doctorService";

const WorkerQrScanner = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [worker, setWorker] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadDoctors = useCallback(async () => {
    const data = await getHospitalDoctors();
    setDoctors((data || []).filter((doctor) => doctor.status === "ACTIVE" && doctor.role !== "READ_ONLY"));
  }, []);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      // Scanner may already be stopped after a successful decode.
    }
    try {
      scanner.clear();
    } catch {
      // Ignore cleanup errors.
    }
  }, []);

  const handleScan = useCallback(async (decodedText) => {
    await stopScanner();
    setScannerOpen(false);
    setError("");
    try {
      const workerData = await lookupWorkerByQr(decodedText);
      setWorker(workerData);
      setDoctorId("");
      if (workerData.hospitalRelationshipStatus === "ACTIVE") {
        await loadDoctors();
      }
    } catch (err) {
      setError(getApiError(err, "Invalid or expired worker QR code."));
    }
  }, [loadDoctors, stopScanner]);

  useEffect(() => {
    if (!scannerOpen || worker) return undefined;

    let cancelled = false;

    const start = async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (cancelled) return;

      const scanner = new Html5Qrcode("worker-qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScan(decodedText),
          () => {},
        );
      } catch (err) {
        if (!cancelled) {
          scannerRef.current = null;
          setScannerOpen(false);
          setError(getApiError(err, "Unable to access the camera. Please allow camera access and try again."));
        }
        try {
          await scanner.clear();
        } catch {
          // Ignore cleanup errors.
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [scannerOpen, worker, handleScan, stopScanner]);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const openScanner = () => {
    setError("");
    setWorker(null);
    setDoctorId("");
    setDoctors([]);
    setScannerOpen(true);
  };

  const handleAddToHospital = async () => {
    if (!worker) return;
    setAdding(true);
    setError("");
    try {
      await addWorkerToHospital(worker.id);
      setWorker((current) => ({ ...current, hospitalRelationshipStatus: "ACTIVE" }));
      await loadDoctors();
    } catch (err) {
      setError(getApiError(err, "Unable to add the worker to this hospital."));
    } finally {
      setAdding(false);
    }
  };

  const relationship = worker?.hospitalRelationshipStatus;
  const relationshipLabel =
    relationship === "ACTIVE" ? "ACTIVE" :
    relationship === "AVAILABLE" ? "NEW WORKER" :
    relationship === "OTHER_HOSPITAL" ? "OTHER HOSPITAL" :
    relationship;
  const relationshipTone =
    relationship === "ACTIVE" ? "status-active" :
    relationship === "OTHER_HOSPITAL" ? "status-suspended" :
    "status-inactive";

  return (
    <RoleLayout title="Start a worker visit">
      {error && <div className="alert error" role="alert">{error}</div>}

      <section className="panel hospital-visit-start-panel">
        {!worker && !scannerOpen && (
          <div className="hospital-scan-choice">
            <h2>Start worker visit</h2>
            <div className="hospital-scan-choice-actions">
              <button type="button" className="button button-primary hospital-scan-choice-button" onClick={openScanner}>
                Scan QR
              </button>
              <button type="button" className="button button-secondary hospital-scan-choice-button" onClick={() => navigate("/hospital/find-worker")}>
                Find by phone
              </button>
            </div>
          </div>
        )}

        {!worker && scannerOpen && (
          <div className="hospital-active-scanner">
            <div className="hospital-scanner-toolbar">
              <h2>Scan worker QR</h2>
              <button type="button" className="button button-secondary" onClick={() => { stopScanner(); setScannerOpen(false); }}>
                Back
              </button>
            </div>
            <div id="worker-qr-reader" className="qr-reader hospital-qr-reader-clean" aria-label="QR scanner" />
          </div>
        )}

        {worker && (
          <div className="scan-success">
            <span className={`status-badge ${relationshipTone}`}>{relationshipLabel}</span>
            <div className="scan-person">
              <span className="avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span>
              <div>
                <h3>{worker.fullName || "Worker"}</h3>
                <p>{worker.workerCode || "Worker record"}</p>
              </div>
            </div>
            <div className="scan-details">
              <span><small>Phone</small><strong>{worker.phone || "—"}</strong></span>
              <span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span>
            </div>

            {relationship === "AVAILABLE" && (
              <div className="visit-action">
                <button type="button" className="button button-primary" onClick={handleAddToHospital} disabled={adding}>
                  {adding ? "Adding…" : "Add to hospital"}
                </button>
              </div>
            )}

            {relationship === "OTHER_HOSPITAL" && (
              <div className="alert error">
                This worker is currently associated with another hospital.
              </div>
            )}

            {relationship === "ACTIVE" && (
              <div className="visit-action">
                <div className="field">
                  <label htmlFor="doctor">Doctor</label>
                  <select id="doctor" className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {doctors.length === 0 && <div className="alert error">No active doctors available.</div>}
                <div className="modal-actions">
                  <button className="button button-secondary" type="button" onClick={openScanner}>Scan another</button>
                  <button className="button button-primary" type="button" onClick={() => navigate("/hospital/assign-doctor")}>Assign doctor</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </RoleLayout>
  );
};

export default WorkerQrScanner;
