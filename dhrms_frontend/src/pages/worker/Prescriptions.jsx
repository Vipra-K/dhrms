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
  useEffect(() => {
    getMyWorkerMedicalRecords().then((data) => setRecords(Array.isArray(data) ? data : [])).catch((err) => setError(getApiError(err, "Unable to load prescriptions."))).finally(() => setLoading(false));
  }, []);
  const prescriptions = useMemo(() => records.flatMap((record) => (record.prescriptions || []).map((prescription) => ({ ...prescription, visitDate: record.visitDate, hospitalName: record.hospitalName, doctorName: record.doctorName }))), [records]);
  if (loading) return <RoleLayout title="Prescriptions"><div className="loading-card">Loading prescriptions…</div></RoleLayout>;
  return <RoleLayout title="Prescriptions" description="Your prescriptions from all completed and recorded clinical visits.">
    {error && <div className="alert error" role="alert">{error}</div>}
    {prescriptions.length === 0 ? <div className="empty-state-card"><h3>No prescriptions</h3><p>Prescriptions issued during your clinical visits will appear here.</p></div> : <div className="record-timeline">{prescriptions.map((item) => <article className="medical-record-card" key={`${item.id}-${item.visitDate}`}><div className="record-date"><strong>{formatDate(item.visitDate)}</strong><span>{item.hospitalName || "Hospital unavailable"}</span></div><div className="record-body"><div className="record-heading"><div><span className="eyebrow">Prescription</span><h3>{item.medicineName}</h3><p>Prescribed by {item.doctorName || "Doctor unavailable"}</p></div></div><div className="record-fields"><div><small>Dosage</small><p>{item.dosage || "—"}</p></div><div><small>Frequency</small><p>{item.frequency || "—"}</p></div><div><small>Duration</small><p>{item.duration || "—"}</p></div><div><small>Instructions</small><p>{item.instructions || "—"}</p></div></div></div></article>)}</div>}
  </RoleLayout>;
};
export default Prescriptions;
