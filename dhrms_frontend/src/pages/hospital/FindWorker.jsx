import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { lookupWorkerByPhone, getWorkerByCode } from "../../services/workerService";
import { getApiError } from "../../services/api";

const FindWorker = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("phone");
  const [value, setValue] = useState("");
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    setError("");
    setWorker(null);
    const searchValue = value.trim();

    if (!searchValue) {
      setError(searchType === "phone" ? "Please enter a phone number" : "Please enter a worker ID");
      return;
    }

    if (searchType === "phone" && !/^\+?[0-9]{10,15}$/.test(searchValue.replace(/[\s-]/g, ""))) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const result = searchType === "phone"
        ? await lookupWorkerByPhone(searchValue.replace(/[\s-]/g, ""))
        : await getWorkerByCode(searchValue);
      setWorker(result);
    } catch (err) {
      setError(getApiError(err, "Worker not found"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Find Worker</h1>
      <p>Identify a worker using their phone number or DHRMS worker ID.</p>

      <div role="tablist" aria-label="Worker identification method">
        <button
          type="button"
          onClick={() => { setSearchType("phone"); setValue(""); setError(""); setWorker(null); }}
          aria-selected={searchType === "phone"}
        >
          Phone Number
        </button>
        <button
          type="button"
          onClick={() => { setSearchType("code"); setValue(""); setError(""); setWorker(null); }}
          aria-selected={searchType === "code"}
        >
          Worker ID
        </button>
      </div>

      <form onSubmit={handleSearch}>
        <label htmlFor="worker-search">
          {searchType === "phone" ? "Phone Number" : "DHRMS Worker ID"}
        </label>
        <input
          id="worker-search"
          type={searchType === "phone" ? "tel" : "text"}
          inputMode={searchType === "phone" ? "tel" : "text"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={searchType === "phone" ? "+91 9000000000" : "DHRMS-WKR-XXXXXXXX"}
          autoComplete={searchType === "phone" ? "tel" : "off"}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Worker"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {worker && (
        <section>
          <h2>Worker Found</h2>
          <p><strong>Worker ID:</strong> {worker.workerCode}</p>
          <p><strong>Name:</strong> {worker.fullName}</p>
          <p><strong>Date of Birth:</strong> {worker.dateOfBirth || "-"}</p>
          <p><strong>Gender:</strong> {worker.gender || "-"}</p>
          <p><strong>Blood Group:</strong> {worker.bloodGroup || "-"}</p>
          <p><strong>Phone:</strong> {worker.phone || "-"}</p>
          <p><strong>Address:</strong> {worker.address || "-"}</p>
          <p><strong>Status:</strong> {worker.active ? "ACTIVE" : "INACTIVE"}</p>
          <button onClick={() => navigate(`/hospital/workers/${worker.id}`)}>
            Open Worker Profile
          </button>
        </section>
      )}

      <hr />
      <button type="button" onClick={() => navigate("/hospital/workers/scan")}>
        Scan Worker QR Instead
      </button>
    </div>
  );
};

export default FindWorker;
