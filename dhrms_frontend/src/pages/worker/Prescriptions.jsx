import { useEffect, useMemo, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkerMedicalRecords } from "../../services/workerService";
import { getApiError } from "../../services/api";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

const Prescriptions = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("ALL");

  const load = async () => {
    try {
      setError("");
      const data = await getMyWorkerMedicalRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err, "Unable to load prescriptions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const prescriptions = useMemo(() => records.flatMap((record) => (record.prescriptions || []).map((prescription) => ({ ...prescription, visitDate: record.visitDate, hospitalName: record.hospitalName, doctorName: record.doctorName }))), [records]);
  const hospitals = useMemo(() => [...new Set(prescriptions.map((item) => item.hospitalName).filter(Boolean))], [prescriptions]);
  const filtered = useMemo(() => hospitalFilter === "ALL" ? prescriptions : prescriptions.filter((item) => item.hospitalName === hospitalFilter), [prescriptions, hospitalFilter]);

  if (loading) return <RoleLayout title="Prescriptions"><div className="loading-card">Loading your prescriptions…</div></RoleLayout>;

  return (
    <RoleLayout title="Prescriptions" description="Medicines recorded by authorized doctors during your clinical visits.">
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="worker-page-toolbar">
        <div><span className="eyebrow">Medication record</span><h2>{filtered.length} prescription{filtered.length === 1 ? "" : "s"}</h2><p>Prescription information is read-only in the worker portal.</p></div>
        <label className="field compact-filter"><span>Hospital</span><select className="select compact-select" value={hospitalFilter} onChange={(event) => setHospitalFilter(event.target.value)}><option value="ALL">All hospitals</option>{hospitals.map((hospital) => <option key={hospital} value={hospital}>{hospital}</option>)}</select></label>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state-card worker-empty-state"><span className="worker-empty-large">Rx</span><div><h3>No prescriptions recorded</h3><p>{prescriptions.length ? "No prescriptions match the selected hospital." : "Prescriptions issued during your clinical visits will appear here."}</p>{hospitalFilter !== "ALL" && <button className="button button-secondary" type="button" onClick={() => setHospitalFilter("ALL")}>Show all hospitals</button>}</div></div>
      ) : (
        <div className="worker-prescription-grid">
          {filtered.map((item) => (
            <article className="worker-prescription-card" key={`${item.id}-${item.visitDate}`}>
              <div className="worker-prescription-top"><span className="worker-medication-icon">Rx</span><div><span className="eyebrow">{formatDate(item.visitDate)}</span><h3>{item.medicineName}</h3></div></div>
              <p className="worker-prescribed-by">Prescribed by <strong>{item.doctorName || "Doctor unavailable"}</strong></p>
              <div className="worker-medication-details">
                <div><small>Dosage</small><strong>{item.dosage || "—"}</strong></div>
                <div><small>Frequency</small><strong>{item.frequency || "—"}</strong></div>
                <div><small>Duration</small><strong>{item.duration || "—"}</strong></div>
              </div>
              {item.instructions && <div className="worker-instruction"><small>Instructions</small><p>{item.instructions}</p></div>}
              <footer><span>{item.hospitalName || "Hospital unavailable"}</span><span className="status-badge status-active">RECORDED</span></footer>
            </article>
          ))}
        </div>
      )}
    </RoleLayout>
  );
};

export default Prescriptions;
