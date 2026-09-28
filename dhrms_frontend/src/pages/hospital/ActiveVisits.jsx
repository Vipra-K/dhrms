import { useCallback, useEffect, useMemo, useState } from "react";
import "./../hospital-pages.css";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getHospitalActiveEncounters } from "../../services/encounterService";
import { getWorkers } from "../../services/workerService";
import { getApiError } from "../../services/api";

const getAssignedDoctor = (record) =>
  record?.assignedDoctor?.doctor ??
  record?.assignedDoctor ??
  record?.doctor ??
  null;

const getDoctorName = (visit, worker) => {
  const doctor = visit?.doctor ?? visit?.assignedDoctor ?? getAssignedDoctor(worker);
  return visit?.doctorName ?? doctor?.fullName ?? doctor?.name ?? "Unassigned";
};

const getDoctorSpecialization = (visit, worker) => {
  const doctor = visit?.doctor ?? visit?.assignedDoctor ?? getAssignedDoctor(worker);
  return visit?.doctorSpecialization ?? doctor?.specialization ?? doctor?.speciality ?? "Clinical team";
};

const ActiveVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [activeVisits, workerList] = await Promise.all([
        getHospitalActiveEncounters(),
        getWorkers().catch(() => []),
      ]);
      setVisits(activeVisits || []);
      setWorkers(Array.isArray(workerList) ? workerList : []);
    } catch (err) {
      setError(getApiError(err, "Unable to load active visits."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const workersById = useMemo(() => {
    const map = new Map();
    workers.forEach((worker) => {
      if (worker?.id != null) map.set(String(worker.id), worker);
      if (worker?.workerCode) map.set(`code:${worker.workerCode}`, worker);
    });
    return map;
  }, [workers]);

  const getWorkerForVisit = (visit) => {
    if (visit?.workerId != null) return workersById.get(String(visit.workerId));
    if (visit?.workerCode) return workersById.get(`code:${visit.workerCode}`);
    return undefined;
  };

  return (
    <RoleLayout
      title="Active visits"
      actions={[
        { label: "Start visit", onClick: () => navigate("/hospital/workers/scan") },
        { label: "Refresh", onClick: load, variant: "secondary", disabled: loading },
      ]}
    >
      {error && <div className="alert error" role="alert">{error}</div>}
      <section className="panel">
        <div className="section-toolbar" style={{ marginBottom: "18px" }}>
          <div><span className="eyebrow">Live queue</span><h2>{visits.length} active visit{visits.length === 1 ? "" : "s"}</h2></div>
        </div>

        {loading ? (
          <div className="loading-card">Loading visits…</div>
        ) : visits.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">+</span>
            <h3>No active visits</h3>
            <p>Start a visit from a worker QR code or phone lookup.</p>
            <div className="row-actions" style={{ justifyContent: "center" }}>
              <button className="button button-primary" type="button" onClick={() => navigate("/hospital/workers/scan")}>Scan QR</button>
              <button className="button button-secondary" type="button" onClick={() => navigate("/hospital/find-worker")}>Find worker</button>
            </div>
          </div>
        ) : (
          <div className="table-card">
            <table className="table">
              <thead><tr><th>Worker</th><th>Doctor</th><th>Started</th><th>Status</th></tr></thead>
              <tbody>
                {visits.map((visit) => {
                  const worker = getWorkerForVisit(visit);
                  return (
                    <tr key={visit.id}>
                      <td>
                        <div className="person-cell">
                          <span className="avatar">{(visit.workerName || worker?.fullName || "W").charAt(0).toUpperCase()}</span>
                          <div><strong>{visit.workerName || worker?.fullName || "Worker"}</strong><small>{visit.workerCode || worker?.workerCode || "Worker record"}</small></div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{getDoctorName(visit, worker)}</strong>
                          <small>{getDoctorSpecialization(visit, worker)}</small>
                        </div>
                      </td>
                      <td>{visit.startedAt ? new Date(visit.startedAt).toLocaleString() : "—"}</td>
                      <td><span className="status-badge status-active">ACTIVE</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </RoleLayout>
  );
};

export default ActiveVisits;
