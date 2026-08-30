import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

import { lookupWorkerByQr } from "../../services/workerService";

const WorkerQrScanner = () => {
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "worker-qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false,
    );

    const onScanSuccess = async (decodedText) => {
      scanner.clear();

      try {
        const data = await lookupWorkerByQr(decodedText);

        setWorker(data);
      } catch (error) {
        setError(error.response?.data?.error || "Invalid worker QR");
      }
    };

    const onScanFailure = () => {
      // Scanner continuously tries to detect the QR.
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div>
      <h1>Scan Worker ID</h1>

      {!worker && <div id="worker-qr-reader" />}

      {error && <p>{error}</p>}

      {worker && (
        <section>
          <h2>Worker Found</h2>

          <p>Worker ID: {worker.workerCode}</p>

          <p>Name: {worker.fullName}</p>

          <p>Blood Group: {worker.bloodGroup || "-"}</p>

          <p>Date of Birth: {worker.dateOfBirth || "-"}</p>

          <p>Phone: {worker.phone || "-"}</p>

          <button onClick={() => navigate(`/hospital/workers/${worker.id}`)}>
            View Worker
          </button>
        </section>
      )}
    </div>
  );
};

export default WorkerQrScanner;
