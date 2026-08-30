import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getWorkerByCode } from "../../services/workerService";

const FindWorker = () => {
  const navigate = useNavigate();

  const [workerCode, setWorkerCode] = useState("");

  const [worker, setWorker] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setWorker(null);

    const code = workerCode.trim();

    if (!code) {
      setError("Please enter a worker ID");
      return;
    }

    setLoading(true);

    try {
      const data = await getWorkerByCode(code);

      setWorker(data);
    } catch (error) {
      setError(error.response?.data?.error || "Worker not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Find Worker</h1>

      <p>Enter the worker's DHRMS ID to find their record.</p>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={workerCode}
          onChange={(event) => setWorkerCode(event.target.value)}
          placeholder="DHRMS-WKR-XXXXXXXX"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Worker"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {worker && (
        <section>
          <h2>Worker Found</h2>

          <p>
            <strong>Worker ID:</strong> {worker.workerCode}
          </p>

          <p>
            <strong>Name:</strong> {worker.fullName}
          </p>

          <p>
            <strong>Date of Birth:</strong> {worker.dateOfBirth || "-"}
          </p>

          <p>
            <strong>Gender:</strong> {worker.gender || "-"}
          </p>

          <p>
            <strong>Blood Group:</strong> {worker.bloodGroup || "-"}
          </p>

          <p>
            <strong>Phone:</strong> {worker.phone || "-"}
          </p>

          <p>
            <strong>Address:</strong> {worker.address || "-"}
          </p>

          <p>
            <strong>Status:</strong> {worker.active ? "ACTIVE" : "INACTIVE"}
          </p>

          <button onClick={() => navigate(`/hospital/workers/${worker.id}`)}>
            Open Worker Profile
          </button>
        </section>
      )}

      <hr />

      <button onClick={() => navigate("/hospital/workers/scan")}>
        Scan Worker QR Instead
      </button>
    </div>
  );
};

export default FindWorker;
