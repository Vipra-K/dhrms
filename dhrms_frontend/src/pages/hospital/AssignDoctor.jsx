import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getApiError } from "../../services/api";
import { getHospitalDoctors } from "../../services/doctorService";
import { assignWorkerToDoctor, getWorkers } from "../../services/workerService";
import "./AssignDoctor.css";

const AssignDoctor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [workerId, setWorkerId] = useState(searchParams.get("workerId") || "");
  const [doctorId, setDoctorId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true); setError("");
    try {
      const [workerList, doctorList] = await Promise.all([getWorkers(), getHospitalDoctors()]);
      setWorkers(Array.isArray(workerList) ? workerList : []);
      setDoctors((Array.isArray(doctorList) ? doctorList : []).filter((doctor) => doctor.status === "ACTIVE" && doctor.role !== "READ_ONLY"));
    } catch (err) {
      setError(getApiError(err, "Unable to load workers and doctors."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workers;
    return workers.filter((worker) => [worker.fullName, worker.phone, worker.workerCode].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [workers, search]);

  const selectedWorker = workers.find((worker) => String(worker.id) === String(workerId));
  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === String(doctorId));

  useEffect(() => {
    if (selectedWorker?.assignedDoctor?.id) setDoctorId(String(selectedWorker.assignedDoctor.id));
  }, [selectedWorker]);

  const handleAssign = async (event) => {
    event.preventDefault();
    if (!selectedWorker || !selectedDoctor) {
      setError("Select a worker and an active doctor before assigning.");
      return;
    }
    setAssigning(true); setError(""); setSuccess("");
    try {
      await assignWorkerToDoctor(selectedWorker.id, selectedDoctor.id);
      setWorkers((current) => current.map((worker) => String(worker.id) === String(selectedWorker.id) ? { ...worker, assignedDoctor: { ...selectedDoctor } } : worker));
      setSuccess(`${selectedDoctor.fullName} is now assigned to ${selectedWorker.fullName}.`);
    } catch (err) {
      setError(getApiError(err, "Unable to assign the doctor to this worker."));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <RoleLayout
      title="Assign doctor"
      description="Change a worker's current clinician assignment without creating a new visit."
      actions={[{ label: "Find worker", onClick: () => navigate("/hospital/find-worker"), variant: "secondary" }, { label: "Manage doctors", onClick: () => navigate("/hospital/doctors"), variant: "secondary" }]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      {success && <div className="alert success" role="status">{success}</div>}

      <div className="scanner-layout">
        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">Worker directory</span><h2>Select a worker</h2><p>Only workers already associated with this hospital can be assigned.</p></div><button className="button button-secondary" type="button" onClick={loadData} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button></div>
          <div className="field"><label htmlFor="worker-search">Search workers</label><input id="worker-search" className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, or worker ID" /></div>
          {loading ? <div className="loading-card">Loading hospital workers…</div> : filteredWorkers.length === 0 ? <div className="empty-state-card"><span className="empty-icon">W</span><h3>{search ? "No matching workers" : "No workers available"}</h3><p>{search ? "Try another search term." : "Find a worker first to establish the hospital relationship."}</p><button className="button button-primary" type="button" onClick={() => navigate("/hospital/find-worker")}>Find a worker</button></div> : <div className="assignment-list" role="radiogroup" aria-label="Workers">
            {filteredWorkers.map((worker) => {
              const selected = String(worker.id) === String(workerId);
              const currentDoctor = worker.assignedDoctor?.name || worker.assignedDoctor?.fullName || "Unassigned";
              return <button key={worker.id} className={`assignment-option ${selected ? "selected" : ""}`} type="button" role="radio" aria-checked={selected} onClick={() => { setWorkerId(String(worker.id)); setError(""); setSuccess(""); }}><span className="avatar">{(worker.fullName || "W").charAt(0).toUpperCase()}</span><span className="assignment-option-copy"><strong>{worker.fullName || "Worker"}</strong><small>{worker.phone || worker.workerCode || "Worker record"}</small></span><span className="assignment-option-doctor">{currentDoctor}</span></button>;
            })}
          </div>}
        </section>

        <aside className="card">
          <span className="eyebrow">Assignment</span>
          <h3>{selectedWorker ? selectedWorker.fullName : "Select a worker"}</h3>
          <p>{selectedWorker ? "Choose the active doctor who should own this worker's current assignment." : "Choose a worker from the directory to continue."}</p>
          <form onSubmit={handleAssign}>
            <div className="field"><label htmlFor="assignment-doctor">Active doctor</label><select id="assignment-doctor" className="select" value={doctorId} onChange={(event) => { setDoctorId(event.target.value); setSuccess(""); }} disabled={!selectedWorker || doctors.length === 0}><option value="">Select a doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.fullName}{doctor.specialization ? ` · ${doctor.specialization}` : ""}</option>)}</select></div>
            {doctors.length === 0 && !loading && <div className="alert error">No active clinical doctors are available.</div>}
            {selectedWorker?.assignedDoctor && <div className="info-card"><small>Current assignment</small><strong>{selectedWorker.assignedDoctor.name || selectedWorker.assignedDoctor.fullName}</strong></div>}
            <div className="modal-actions"><button className="button button-secondary" type="button" onClick={() => navigate(selectedWorker ? `/hospital/workers/${selectedWorker.id}` : "/hospital/manage-workers")}>View worker</button><button className="button button-primary" type="submit" disabled={assigning || !selectedWorker || !selectedDoctor}>{assigning ? "Assigning…" : "Assign doctor"}</button></div>
          </form>
        </aside>
      </div>
    </RoleLayout>
  );
};

export default AssignDoctor;
