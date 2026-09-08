import { useEffect, useMemo, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkerMedicalRecords } from "../../services/workerService";
import { getApiError } from "../../services/api";
import {
  downloadMedicalAttachment,
  openMedicalAttachment,
} from "../../services/medicalService";

const fileSize = (bytes = 0) =>
  bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const MedicalHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [preview, setPreview] = useState(null);

  const loadRecords = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await getMyWorkerMedicalRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiError(err, "Unable to load medical history."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const hospitals = useMemo(
    () => [...new Set(records.map((record) => record.hospitalName).filter(Boolean))],
    [records],
  );

  const filteredRecords = useMemo(
    () =>
      hospitalFilter === "ALL"
        ? records
        : records.filter((record) => record.hospitalName === hospitalFilter),
    [records, hospitalFilter],
  );

  const openAttachment = async (attachment) => {
    try {
      setError("");
      const url = await openMedicalAttachment(attachment);
      if (attachment.mimeType?.startsWith("image/")) {
        setPreview({ url, name: attachment.fileName });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(getApiError(err, "Unable to open attachment."));
    }
  };

  const closePreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  if (loading) {
    return (
      <RoleLayout title="Medical history">
        <div className="loading-card">Loading your medical history…</div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout
      title="Medical history"
      description="Your clinical visits, diagnoses, treatments, prescriptions and documents from every hospital in one place."
      actions={[
        {
          label: refreshing ? "Refreshing…" : "Refresh",
          onClick: () => loadRecords(true),
          variant: "secondary",
          disabled: refreshing,
        },
      ]}
    >
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      <div className="section-toolbar">
        <div>
          <span className="eyebrow">Clinical history</span>
          <h2>
            {filteredRecords.length} visit{filteredRecords.length === 1 ? "" : "s"}
          </h2>
          <p>
            Records are arranged from your clinical visits. Historical records
            are read-only from the worker portal.
          </p>
        </div>
        <label className="field compact-filter">
          <span>Hospital</span>
          <select
            className="select compact-select"
            value={hospitalFilter}
            onChange={(event) => setHospitalFilter(event.target.value)}
          >
            <option value="ALL">All hospitals</option>
            {hospitals.map((hospital) => (
              <option key={hospital} value={hospital}>
                {hospital}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="empty-state-card">
          <h3>No medical records found</h3>
          <p>
            {records.length === 0
              ? "Your authorized clinical history will appear here after a doctor records a visit."
              : "There are no records for the selected hospital."}
          </p>
          {hospitalFilter !== "ALL" && (
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setHospitalFilter("ALL")}
            >
              Show all hospitals
            </button>
          )}
        </div>
      ) : (
        <div className="record-timeline" aria-label="Medical history timeline">
          {filteredRecords.map((record) => (
            <article className="medical-record-card" key={record.id}>
              <div className="record-date">
                <strong>{formatDate(record.visitDate)}</strong>
                <span>Clinical visit</span>
              </div>

              <div className="record-body">
                <div className="record-heading">
                  <div>
                    <span className="status-badge status-active">
                      {record.hospitalName || "Hospital unavailable"}
                    </span>
                    <h3>{record.diagnosis || "Clinical record"}</h3>
                    <p>
                      Doctor: {record.doctorName || "Doctor information unavailable"}
                    </p>
                  </div>
                  <button
                    className="button button-ghost button-small"
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                  >
                    View details
                  </button>
                </div>

                <div className="record-fields">
                  <div>
                    <small>Symptoms</small>
                    <p>{record.symptoms || "—"}</p>
                  </div>
                  <div>
                    <small>Treatment</small>
                    <p>{record.treatment || "—"}</p>
                  </div>
                  <div>
                    <small>Notes</small>
                    <p>{record.notes || "—"}</p>
                  </div>
                </div>

                <div className="prescription-section">
                  <div className="prescription-header">
                    <h4>Prescriptions</h4>
                    <span className="muted-note">
                      {record.prescriptions?.length || 0} item
                      {record.prescriptions?.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {record.prescriptions?.length ? (
                    <div className="prescription-list">
                      {record.prescriptions.map((item) => (
                        <div className="prescription-item" key={item.id}>
                          <div>
                            <strong>{item.medicineName}</strong>
                            <span>
                              {[item.dosage, item.frequency, item.duration]
                                .filter(Boolean)
                                .join(" · ") || "No dosage details"}
                            </span>
                            {item.instructions && <small>{item.instructions}</small>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-note">No prescriptions for this visit.</p>
                  )}
                </div>

                <div className="prescription-section">
                  <div className="prescription-header">
                    <h4>Documents</h4>
                    <span className="muted-note">
                      {record.attachments?.length || 0} file
                      {record.attachments?.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {record.attachments?.length ? (
                    <div className="prescription-list">
                      {record.attachments.map((item) => (
                        <div className="prescription-item" key={item.id}>
                          <div>
                            <strong>
                              {item.mimeType?.startsWith("image/") ? "🩻" : "📄"} {item.fileName}
                            </strong>
                            <span>
                              {item.mimeType || "Unknown type"} · {fileSize(item.fileSize)}
                            </span>
                          </div>
                          <div>
                            <button
                              className="button button-ghost button-small"
                              type="button"
                              onClick={() => openAttachment(item)}
                            >
                              View
                            </button>
                            <button
                              className="button button-ghost button-small"
                              type="button"
                              onClick={() => downloadMedicalAttachment(item)}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-note">No documents for this visit.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedRecord && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal modal-large"
            role="dialog"
            aria-modal="true"
            aria-labelledby="medical-record-details-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">Medical record</span>
                <h2 id="medical-record-details-title">
                  {selectedRecord.diagnosis || "Clinical record"}
                </h2>
                <p>
                  {selectedRecord.hospitalName || "Hospital unavailable"} · {selectedRecord.doctorName || "Doctor unavailable"}
                </p>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close medical record details"
              >
                ×
              </button>
            </div>

            <div className="record-detail-summary">
              <div>
                <small>Visit date</small>
                <strong>{formatDate(selectedRecord.visitDate)}</strong>
              </div>
              <div>
                <small>Visit started</small>
                <strong>{formatDateTime(selectedRecord.startedAt)}</strong>
              </div>
              <div>
                <small>Hospital</small>
                <strong>{selectedRecord.hospitalName || "—"}</strong>
              </div>
              <div>
                <small>Doctor</small>
                <strong>{selectedRecord.doctorName || "—"}</strong>
              </div>
            </div>

            <div className="record-fields detail-fields">
              <div>
                <small>Symptoms</small>
                <p>{selectedRecord.symptoms || "—"}</p>
              </div>
              <div>
                <small>Diagnosis</small>
                <p>{selectedRecord.diagnosis || "—"}</p>
              </div>
              <div>
                <small>Treatment</small>
                <p>{selectedRecord.treatment || "—"}</p>
              </div>
              <div>
                <small>Notes</small>
                <p>{selectedRecord.notes || "—"}</p>
              </div>
            </div>

            <div className="prescription-section">
              <div className="prescription-header">
                <h4>Prescriptions</h4>
              </div>
              {selectedRecord.prescriptions?.length ? (
                <div className="prescription-list">
                  {selectedRecord.prescriptions.map((item) => (
                    <div className="prescription-item" key={item.id}>
                      <div>
                        <strong>{item.medicineName}</strong>
                        <span>
                          {[item.dosage, item.frequency, item.duration]
                            .filter(Boolean)
                            .join(" · ") || "No dosage details"}
                        </span>
                        {item.instructions && <small>{item.instructions}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted-note">No prescriptions for this visit.</p>
              )}
            </div>

            <div className="prescription-section">
              <div className="prescription-header">
                <h4>Documents</h4>
              </div>
              {selectedRecord.attachments?.length ? (
                <div className="prescription-list">
                  {selectedRecord.attachments.map((item) => (
                    <div className="prescription-item" key={item.id}>
                      <div>
                        <strong>{item.fileName}</strong>
                        <span>{item.mimeType} · {fileSize(item.fileSize)}</span>
                      </div>
                      <div>
                        <button
                          className="button button-ghost button-small"
                          type="button"
                          onClick={() => openAttachment(item)}
                        >
                          View
                        </button>
                        <button
                          className="button button-ghost button-small"
                          type="button"
                          onClick={() => downloadMedicalAttachment(item)}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted-note">No documents for this visit.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="modal-backdrop" role="presentation" onClick={closePreview}>
          <div
            className="modal modal-large"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attachment-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="attachment-preview-title">{preview.name}</h2>
              <button
                className="modal-close"
                type="button"
                onClick={closePreview}
                aria-label="Close attachment preview"
              >
                ×
              </button>
            </div>
            <img
              src={preview.url}
              alt={preview.name}
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default MedicalHistory;
