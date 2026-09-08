import { useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkerMedicalRecords } from "../../services/workerService";
import { getApiError } from "../../services/api";
import { downloadMedicalAttachment, openMedicalAttachment } from "../../services/medicalService";

const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date); };
const size = (bytes = 0) => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const Documents = () => {
  const [documents, setDocuments] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [preview, setPreview] = useState(null);
  useEffect(() => { getMyWorkerMedicalRecords().then((records) => setDocuments((Array.isArray(records) ? records : []).flatMap((record) => (record.attachments || []).map((attachment) => ({ ...attachment, visitDate: record.visitDate, hospitalName: record.hospitalName, doctorName: record.doctorName }))))).catch((err) => setError(getApiError(err, "Unable to load documents."))).finally(() => setLoading(false)); }, []);
  const view = async (document) => { try { const url = await openMedicalAttachment(document); if (document.mimeType?.startsWith("image/")) setPreview({ url, name: document.fileName }); else window.open(url, "_blank", "noopener,noreferrer"); } catch (err) { setError(getApiError(err, "Unable to open document.")); } };
  const close = () => { if (preview?.url) URL.revokeObjectURL(preview.url); setPreview(null); };
  if (loading) return <RoleLayout title="Documents"><div className="loading-card">Loading documents…</div></RoleLayout>;
  return <RoleLayout title="Documents" description="Medical documents attached to your clinical records. Your worker account is read-only.">
    {error && <div className="alert error" role="alert">{error}</div>}
    {documents.length === 0 ? <div className="empty-state-card"><h3>No documents</h3><p>Documents uploaded by authorized doctors will appear here.</p></div> : <div className="record-timeline">{documents.map((item) => <article className="medical-record-card" key={`${item.id}-${item.visitDate}`}><div className="record-date"><strong>{formatDate(item.visitDate)}</strong><span>{item.hospitalName || "Hospital unavailable"}</span></div><div className="record-body"><div className="record-heading"><div><span className="eyebrow">Medical document</span><h3>{item.fileName}</h3><p>{item.doctorName || "Doctor unavailable"}</p></div><div><button className="button button-ghost button-small" type="button" onClick={() => view(item)}>View</button><button className="button button-ghost button-small" type="button" onClick={() => downloadMedicalAttachment(item)}>Download</button></div></div><div className="record-fields"><div><small>Type</small><p>{item.mimeType || "Unknown"}</p></div><div><small>Size</small><p>{size(item.fileSize)}</p></div><div><small>Uploaded</small><p>{formatDate(item.createdAt)}</p></div></div></div></article>)}</div>}
    {preview && <div className="modal-backdrop" role="presentation" onClick={close}><div className="modal modal-large" role="dialog" aria-modal="true" aria-labelledby="worker-document-preview" onClick={(event) => event.stopPropagation()}><div className="modal-header"><h2 id="worker-document-preview">{preview.name}</h2><button className="modal-close" type="button" onClick={close} aria-label="Close preview">×</button></div><img src={preview.url} alt={preview.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} /></div></div>}
  </RoleLayout>;
};
export default Documents;
