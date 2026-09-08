import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getWorkerByCode,
  getWorkerByPhone,
} from "../../services/workerService";

const FindWorker = () => {
  const navigate = useNavigate();

  const [searchMode, setSearchMode] = useState("phone");
  const [workerCode, setWorkerCode] = useState("");
  const [phone, setPhone] = useState("");
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setWorker(null);

    const value = (searchMode === "phone" ? phone : workerCode).trim();

    if (!value) {
      setError(
        searchMode === "phone"
          ? "Please enter the worker's phone number"
          : "Please enter the worker code",
      );
      return;
    }

    if (searchMode === "phone" && !/^\+?[0-9]{10,15}$/.test(value)) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const data =
        searchMode === "phone"
          ? await getWorkerByPhone(value)
          : await getWorkerByCode(value);

      setWorker(data);
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || "Worker not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Find Worker</h1>

      <p>Identify a worker using their phone number or DHRMS worker code.</p>

      <div>
        <button
          type="button"
          onClick={() => {
            setSearchMode("phone");
            setError("");
            setWorker(null);
          }}
          aria-pressed={searchMode === "phone"}
        >
          Phone Number
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchMode("code");
            setError("");
            setWorker(null);
          }}
          aria-pressed={searchMode === "code"}
        >
          Worker Code
        </button>
      </div>

      <form onSubmit={handleSearch}>
        {searchMode === "phone" ? (
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="9000000000"
            aria-label="Worker phone number"
          />
        ) : (
          <input
            type="text"
            value={workerCode}
            onChange={(event) => setWorkerCode(event.target.value)}
            placeholder="DHRMS-WKR-XXXXXXXX"
            aria-label="Worker code"
          />
        )}

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
