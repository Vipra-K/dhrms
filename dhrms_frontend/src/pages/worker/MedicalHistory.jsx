import { useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkerMedicalRecords } from "../../services/workerService";
import { getApiError } from "../../services/api";
import { downloadMedicalAttachment, openMedicalAttachment } from "../../services/medicalService";

const fileSize = (bytes) => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const MedicalHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("ALL");
  const [preview, setPreview] = useState(null);

  const openAttachment = async (attachment) => {
    try {
      const url = await openMedicalAttachment(attachment);
      if (attachment.mimeType.startsWith("image/")) setPreview({ url, name: attachment.fileName });
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) { setError(getApiError(err, "Unable to open attachment.")); }
  };

  useEffect(() => {
    getMyWorkerMedicalRecords().then(setRecords).catch((err) => setError(getApiError(err, "Unable to load medical history."))).finally(() => setLoading(false));
  }, []);

  if (loading) return <RoleLayout title="Medical history"><div className="loading-card">Loading your medical history…</div></RoleLayout>;
  if (error) return <RoleLayout title="Medical history"><div className="alert error">{error}</div></RoleLayout>;

  const hospitals = [...new Set(records.map((record) => record.hospitalName).filter(Boolean))];
  const filtered = hospitalFilter === "ALL" ? records : records.filter((record) => record.hospitalName === hospitalFilter);

  return <RoleLayout title="Medical history" description="Your clinical visits, diagnoses, treatments, prescriptions and attachments in one timeline.">
    <div className="section-toolbar"><div><span className="eyebrow">Personal records</span><h2>{records.length} visit{records.length === 1 ? "" : "s"}</h2><p>These records are read-only from the worker portal.</p></div><select className="select compact-select" value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}><option value="ALL">All hospitals</option>{hospitals.map((hospital) => <option key={hospital} value={hospital}>{hospital}</option>)}</select></div>
    {filtered.length === 0 ? <div className="empty-state-card"><h3>No medical records found</h3><p>Your authorized clinical history will appear here after a doctor records a visit.</p></div> : <div className="record-timeline">{filtered.map((record) => <article className="medical-record-card" key={record.id}><div className="record-date"><strong>{new Date(record.visitDate).toLocaleDateString()}</strong><span>Visit</span></div><div className="record-body"><div className="record-heading"><div><span className="status-badge status-active">{record.hospitalName}</span><h3>{record.diagnosis}</h3><p>Doctor: {record.doctorName}</p></div></div><div className="record-fields"><div><small>Symptoms</small><p>{record.symptoms || "—"}</p></div><div><small>Treatment</small><p>{record.treatment || "—"}</p></div><div><small>Notes</small><p>{record.notes || "—"}</p></div></div><div className="prescription-section"><div className="prescription-header"><h4>Attachments</h4></div>{record.attachments?.length ? <div className="prescription-list">{record.attachments.map((item) => <div className="prescription-item" key={item.id}><div><strong>{item.mimeType.startsWith("image/") ? "🩻" : "📄"} {item.fileName}</strong><span>{item.mimeType} · {fileSize(item.fileSize)}</span></div><div><button className="button button-ghost button-small" onClick={() => openAttachment(item)}>View</button><button className="button button-ghost button-small" onClick={() => downloadMedicalAttachment(item)}>Download</button></div></div>)}</div> : <p className="muted-note">No attachments for this visit.</p>}</div><div className="prescription-section"><div className="prescription-header"><h4>Prescriptions</h4></div>{record.prescriptions?.length ? <div className="prescription-list">{record.prescriptions.map((item) => <div className="prescription-item" key={item.id}><div><strong>{item.medicineName}</strong><span>{[item.dosage, item.frequency, item.duration].filter(Boolean).join(" · ") || "No dosage details"}</span>{item.instructions && <small>{item.instructions}</small>}</div></div>)}</div> : <p className="muted-note">No prescriptions for this visit.</p>}</div></div></article>)}</div>}
    {preview && <div className="modal-backdrop" onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}><div className="modal modal-large" onClick={(e) => e.stopPropagation()}><div className="modal-header"><h2>{preview.name}</h2><button className="modal-close" onClick={() => { URL.revokeObjectURL(preview.url); setPreview(null); }}>×</button></div><img src={preview.url} alt={preview.name} style={{ maxWidth: "100%", maxHeight: "70vh" }} /></div></div>}
  </RoleLayout>;
};

export default MedicalHistory;
