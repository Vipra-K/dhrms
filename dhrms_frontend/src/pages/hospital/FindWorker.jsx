import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { lookupWorkerByPhone, lookupWorkerByCode } from "../../services/workerService";
import { getHospitalDoctors } from "../../services/doctorService";
import { startEncounter } from "../../services/encounterService";
import { getApiError } from "../../services/api";

const FindWorker = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("phone");
  const [value, setValue] = useState("");
  const [worker, setWorker] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    setError("");
    setWorker(null);
    setDoctorId("");
    const searchValue = value.trim();

    if (!searchValue) {
      setError(searchType === "phone" ? "Please enter a phone number." : "Please enter a DHRMS worker ID.");
      return;
    }

    if (searchType === "phone" && !/^\+?[0-9]{10,15}$/.test(searchValue.replace(/[\s-]/g, ""))) {
      setError("Please enter a valid phone number (10 to 15 digits).");
      return;
    }

    setLoading(true);
    try {
      const [result, doctorList] = await Promise.all([
        searchType === "phone"
          ? lookupWorkerByPhone(searchValue.replace(/[\s-]/g, ""))
          : lookupWorkerByCode(searchValue),
        getHospitalDoctors(),
      ]);
      setWorker(result);
      setDoctors((doctorList || []).filter((d) => d.status === "ACTIVE" && d.role !== "READ_ONLY"));
    } catch (err) {
      setError(getApiError(err, "Worker not found with the provided details."));
    } finally {
      setLoading(false);
    }
  };

  const handleStartVisit = async () => {
    if (!worker || !doctorId) {
      setError("Select the doctor who will handle this visit.");
      return;
    }
    setStarting(true);
    setError("");
    try {
      const encounter = await startEncounter(worker.id, doctorId);
      navigate(`/doctor/encounters/${encounter.id}`, { replace: true });
    } catch (err) {
      setError(getApiError(err, "Unable to start the visit."));
    } finally {
      setStarting(false);
    }
  };

  return (
    <RoleLayout
      title="Find Worker"
      description="Search for a registered worker by phone number or DHRMS worker ID to start a visit."
      actions={[
        { label: "Scan Worker QR", onClick: () => navigate("/hospital/workers/scan"), variant: "secondary" },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}

      <div className="scanner-layout">
        <div className="panel scanner-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Search Worker</span>
              <h2>Lookup worker details</h2>
              <p>Search using the worker's phone number or 8-digit DHRMS worker code.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <button
              type="button"
              className={searchType === "phone" ? "button button-primary" : "button button-secondary"}
              onClick={() => { setSearchType("phone"); setValue(""); setError(""); setWorker(null); }}
            >
              Phone Number
            </button>
            <button
              type="button"
              className={searchType === "code" ? "button button-primary" : "button button-secondary"}
              onClick={() => { setSearchType("code"); setValue(""); setError(""); setWorker(null); }}
            >
              DHRMS Worker ID
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className="field">
              <label htmlFor="worker-search">
                {searchType === "phone" ? "Phone Number" : "DHRMS Worker ID"}
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  id="worker-search"
                  className="input"
                  type={searchType === "phone" ? "tel" : "text"}
                  inputMode={searchType === "phone" ? "tel" : "text"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={searchType === "phone" ? "9000000000" : "DHRMS-WKR-XXXXXXXX"}
                  autoComplete={searchType === "phone" ? "tel" : "off"}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="button button-primary" disabled={loading}>
                  {loading ? "Searching…" : "Find Worker"}
                </button>
              </div>
            </div>
          </form>

          {worker && (
            <div style={{ marginTop: "1.5rem" }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Worker Found</span>
                  <h2>Verify identity & start visit</h2>
                </div>
              </div>

              <div className="scan-success">
                <span className="status-badge status-active">Verified worker</span>
                <div className="scan-person">
                  <span className="avatar">{(worker.fullName || "W").charAt(0)}</span>
                  <div>
                    <h3>{worker.fullName}</h3>
                    <p>{worker.workerCode}</p>
                  </div>
                </div>
                <div className="scan-details">
                  <span><small>Phone</small><strong>{worker.phone || "—"}</strong></span>
                  <span><small>Blood group</small><strong>{worker.bloodGroup || "—"}</strong></span>
                  <span><small>Date of birth</small><strong>{worker.dateOfBirth ? String(worker.dateOfBirth).slice(0, 10) : "—"}</strong></span>
                  <span><small>Gender</small><strong>{worker.gender || "—"}</strong></span>
                  <span><small>Employer</small><strong>{worker.employerName || "—"}</strong></span>
                  <span><small>Emergency Contact</small><strong>{worker.emergencyContactName ? `${worker.emergencyContactName} (${worker.emergencyContactPhone || ""})` : "—"}</strong></span>
                </div>
              </div>

              <div className="field" style={{ marginTop: "1rem" }}>
                <label htmlFor="doctor">Doctor for this visit</label>
                <select
                  id="doctor"
                  className="select"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  <option value="">Select an active doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {doctors.length === 0 && (
                <div className="alert error">
                  No active clinical doctor is available at this hospital. Add or activate a doctor before starting the visit.
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => { setWorker(null); setValue(""); }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleStartVisit}
                  disabled={starting || !doctorId || doctors.length === 0}
                >
                  {starting ? "Starting visit…" : "Start visit"}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="card scanner-help">
          <span className="eyebrow">How to search</span>
          <h3>Search options</h3>
          <ol>
            <li><strong>Phone Number</strong>: Enter the 10-digit registered phone number of the worker.</li>
            <li><strong>Worker ID</strong>: Enter the full <code>DHRMS-WKR-XXXXXXXX</code> code.</li>
            <li>Select an active doctor and click <strong>Start Visit</strong> to begin consultation.</li>
          </ol>
          <p>You can also use the QR scanner if the worker presents their DHRMS QR card.</p>
          <button
            type="button"
            className="button button-secondary"
            style={{ marginTop: "1rem", width: "100%" }}
            onClick={() => navigate("/hospital/workers/scan")}
          >
            Scan Worker QR Instead
          </button>
        </aside>
      </div>
    </RoleLayout>
  );
};

export default FindWorker;
