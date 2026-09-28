
import { useEffect, useState } from "react";
import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  createPrescription,
  updatePrescription,
  downloadMedicalAttachment,
  openMedicalAttachment,
  revokeMedicalAttachment,
  uploadMedicalAttachments,
} from "../../services/medicalService";
import { getApiError } from "../../services/api";

const blankRecord = { symptoms: "", diagnosis: "", treatment: "", notes: "" };
const blankPrescription = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const diagnosisOptions = [
  "Fever",
  "Acute respiratory infection",
  "Common cold",
  "Gastritis",
  "Hypertension",
  "Diabetes mellitus",
  "Headache / migraine",
  "Back pain",
  "Musculoskeletal pain",
  "Skin infection",
  "Allergic condition",
  "Other",
];

const symptomOptions = [
  "Fever",
  "Cough",
  "Cold",
  "Headache",
  "Body pain",
  "Fatigue",
  "Sore throat",
  "Nausea",
  "Vomiting",
  "Abdominal pain",
  "Breathlessness",
  "Dizziness",
];

const treatmentOptions = [
  "Medication",
  "Supportive care",
  "Lifestyle modification",
  "Observation / follow-up",
  "Referral",
  "Procedure",
  "Other",
];

const medicineOptions = [
  "Paracetamol",
  "Ibuprofen",
  "Cetirizine",
  "Amoxicillin",
  "Azithromycin",
  "Pantoprazole",
  "Omeprazole",
  "Metformin",
  "Amlodipine",
  "ORS",
  "Other",
];

const dosageOptions = [
  "250 mg",
  "500 mg",
  "650 mg",
  "1 g",
  "5 mL",
  "10 mL",
  "1 tablet",
  "2 tablets",
  "As directed",
  "Custom",
];

const frequencyOptions = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "As directed",
];

const durationOptions = [
  "1 day",
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "30 days",
  "As needed",
  "As directed",
];

const instructionOptions = [
  "After food",
  "Before food",
  "With food",
  "At bedtime",
  "In the morning",
  "As needed",
  "As directed",
  "Custom",
];

const fileSize = (bytes) =>
  bytes < 1024 * 1024
    ? Math.ceil(bytes / 1024) + " KB"
    : (bytes / (1024 * 1024)).toFixed(1) + " MB";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const maxFileSize = 10 * 1024 * 1024;

const MedicalRecords = ({ workerId, encounterId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recordForm, setRecordForm] = useState(blankRecord);
  const [prescriptionForm, setPrescriptionForm] = useState(blankPrescription);

  const [recordTarget, setRecordTarget] = useState(null);
  const [prescriptionTarget, setPrescriptionTarget] = useState(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [prescriptionRecordId, setPrescriptionRecordId] = useState(null);

  const [diagnosisPreset, setDiagnosisPreset] = useState("");
  const [symptomPreset, setSymptomPreset] = useState("");
  const [treatmentPreset, setTreatmentPreset] = useState("");

  const [medicinePreset, setMedicinePreset] = useState("");
  const [dosagePreset, setDosagePreset] = useState("");
  const [instructionPreset, setInstructionPreset] = useState("");

  const [saving, setSaving] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const data = await getMedicalRecords(workerId);
        if (!ignore) setRecords(data);
      } catch (err) {
        if (!ignore) setError(getApiError(err, "Unable to load medical records."));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [workerId]);

  const currentEncounterRecord = encounterId
    ? records.find((record) => Number(record.encounterId) === Number(encounterId))
    : null;

  const recordFormDirty =
    showRecordForm && JSON.stringify(recordForm) !== JSON.stringify(blankRecord);

  const prescriptionFormDirty =
    Boolean(prescriptionRecordId || prescriptionTarget) &&
    JSON.stringify(prescriptionForm) !== JSON.stringify(blankPrescription);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!recordFormDirty && !prescriptionFormDirty && !attachmentFiles.length) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [recordFormDirty, prescriptionFormDirty, attachmentFiles.length]);

  const resetRecordForm = () => {
    setRecordForm(blankRecord);
    setRecordTarget(null);
    setDiagnosisPreset("");
    setSymptomPreset("");
    setTreatmentPreset("");
    setAttachmentFiles([]);
  };

  const openNewRecord = () => {
    resetRecordForm();
    setShowRecordForm(true);
    setError("");
  };

  const openEditRecord = (record) => {
    const diagnosis = record.diagnosis || "";
    const treatment = record.treatment || "";

    setRecordTarget(record);
    setRecordForm({
      symptoms: record.symptoms || "",
      diagnosis,
      treatment,
      notes: record.notes || "",
    });
    setDiagnosisPreset(
      diagnosisOptions.includes(diagnosis) ? diagnosis : diagnosis ? "Other" : "",
    );
    setTreatmentPreset(
      treatmentOptions.some((option) => treatment.startsWith(option))
        ? treatment.split(":")[0]
        : treatment
          ? "Other"
          : "",
    );
    setSymptomPreset("");
    setAttachmentFiles([]);
    setShowRecordForm(true);
    setError("");
  };

  const addSymptom = () => {
    if (!symptomPreset) return;

    setRecordForm((current) => {
      const existing = current.symptoms
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (existing.includes(symptomPreset)) return current;

      return {
        ...current,
        symptoms: [...existing, symptomPreset].join(", "),
      };
    });

    setSymptomPreset("");
  };

  const handleDiagnosisPreset = (value) => {
    setDiagnosisPreset(value);

    if (value && value !== "Other") {
      setRecordForm((current) => ({ ...current, diagnosis: value }));
    } else if (value === "Other") {
      setRecordForm((current) => ({ ...current, diagnosis: "" }));
    }
  };

  const handleTreatmentPreset = (value) => {
    setTreatmentPreset(value);

    if (value && value !== "Other") {
      setRecordForm((current) => ({ ...current, treatment: value + ": " }));
    } else if (value === "Other") {
      setRecordForm((current) => ({ ...current, treatment: "" }));
    }
  };

  const submitRecord = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!recordForm.diagnosis.trim()) {
        setError("Diagnosis is required.");
        setSaving(false);
        return;
      }

      if (recordTarget) {
        const saved = await updateMedicalRecord(recordTarget.id, recordForm);
        let attachments = saved.attachments || [];

        if (attachmentFiles.length) {
          attachments = [
            ...attachments,
            ...(await uploadMedicalAttachments(saved.id, attachmentFiles)),
          ];
        }

        setRecords((current) =>
          current.map((record) =>
            record.id === saved.id ? { ...saved, attachments } : record,
          ),
        );
      } else {
        if (!encounterId) {
          setError("A record can only be added from an active visit.");
          setSaving(false);
          return;
        }

        if (currentEncounterRecord) {
          setError("This visit already has a medical record. Edit it instead.");
          setSaving(false);
          return;
        }

        const saved = await createMedicalRecord(workerId, {
          ...recordForm,
          encounterId: Number(encounterId),
        });

        let attachments = saved.attachments || [];

        if (attachmentFiles.length) {
          attachments = [
            ...attachments,
            ...(await uploadMedicalAttachments(saved.id, attachmentFiles)),
          ];
        }

        setRecords((current) => [{ ...saved, attachments }, ...current]);
      }

      setShowRecordForm(false);
      resetRecordForm();
    } catch (err) {
      setError(getApiError(err, "Unable to save medical record."));
    } finally {
      setSaving(false);
    }
  };

  const selectAttachments = (files) => {
    const invalidType = files.find((file) => !allowedTypes.includes(file.type));

    if (invalidType) {
      setError(
        invalidType.name + " is not supported. Use JPG, PNG, WEBP or PDF.",
      );
      return;
    }

    const oversized = files.find((file) => file.size > maxFileSize);

    if (oversized) {
      setError(oversized.name + " is larger than 10 MB.");
      return;
    }

    setError("");
    setAttachmentFiles(files);
  };

  const openAttachment = async (attachment) => {
    try {
      const url = await openMedicalAttachment(attachment);

      if (attachment.mimeType.startsWith("image/")) {
        setPreview({ url, name: attachment.fileName });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(getApiError(err, "Unable to open attachment."));
    }
  };

  const revokeAttachment = async (recordId, attachmentId) => {
    if (!window.confirm("Revoke this attachment?")) return;

    try {
      await revokeMedicalAttachment(attachmentId);
      setRecords((current) =>
        current.map((record) =>
          record.id === recordId
            ? {
                ...record,
                attachments: record.attachments.filter(
                  (item) => item.id !== attachmentId,
                ),
              }
            : record,
        ),
      );
    } catch (err) {
      setError(getApiError(err, "Unable to revoke attachment."));
    }
  };

  const openNewPrescription = (recordId) => {
    setPrescriptionTarget(null);
    setPrescriptionRecordId(recordId);
    setPrescriptionForm(blankPrescription);
    setMedicinePreset("");
    setDosagePreset("");
    setInstructionPreset("");
    setError("");
  };

  const openEditPrescription = (prescription) => {
    const medicine = prescription.medicineName || "";
    const dosage = prescription.dosage || "";
    const instructions = prescription.instructions || "";

    setPrescriptionTarget(prescription);
    setPrescriptionRecordId(null);
    setPrescriptionForm({
      medicineName: medicine,
      dosage,
      frequency: prescription.frequency || "",
      duration: prescription.duration || "",
      instructions,
    });

    setMedicinePreset(
      medicineOptions.includes(medicine) ? medicine : medicine ? "Other" : "",
    );
    setDosagePreset(
      dosageOptions.includes(dosage) ? dosage : dosage ? "Custom" : "",
    );
    setInstructionPreset(
      instructionOptions.includes(instructions)
        ? instructions
        : instructions
          ? "Custom"
          : "",
    );
    setError("");
  };

  const handleMedicinePreset = (value) => {
    setMedicinePreset(value);
    setPrescriptionForm((current) => ({
      ...current,
      medicineName: value && value !== "Other" ? value : "",
    }));
  };

  const handleDosagePreset = (value) => {
    setDosagePreset(value);
    setPrescriptionForm((current) => ({
      ...current,
      dosage: value && value !== "Custom" ? value : "",
    }));
  };

  const handleInstructionPreset = (value) => {
    setInstructionPreset(value);
    setPrescriptionForm((current) => ({
      ...current,
      instructions: value && value !== "Custom" ? value : "",
    }));
  };

  const submitPrescription = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!prescriptionForm.medicineName.trim()) {
        setError("Medicine name is required.");
        setSaving(false);
        return;
      }

      const saved = prescriptionTarget
        ? await updatePrescription(prescriptionTarget.id, prescriptionForm)
        : await createPrescription(prescriptionRecordId, prescriptionForm);

      setRecords((current) =>
        current.map((record) => {
          const targetId =
            prescriptionTarget?.medicalRecordId || prescriptionRecordId;

          if (record.id !== targetId) return record;

          const prescriptions = prescriptionTarget
            ? record.prescriptions.map((item) =>
                item.id === saved.id ? saved : item,
              )
            : [...(record.prescriptions || []), saved];

          return { ...record, prescriptions };
        }),
      );

      setPrescriptionForm(blankPrescription);
      setPrescriptionTarget(null);
      setPrescriptionRecordId(null);
      setMedicinePreset("");
      setDosagePreset("");
      setInstructionPreset("");
    } catch (err) {
      setError(getApiError(err, "Unable to save prescription."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-card">Loading medical records…</div>;

  return (
    <section className="medical-records-section">
      <div className="section-toolbar">
        <div>
          <span className="eyebrow">Records</span>
          <h2>Medical records</h2>
          <p>{records.length} record{records.length === 1 ? "" : "s"}</p>
        </div>

        {encounterId && !currentEncounterRecord && (
          <button className="button button-primary" type="button" onClick={openNewRecord}>
            Add record
          </button>
        )}
      </div>

      {encounterId && currentEncounterRecord && (
        <div className="alert success" role="status">
          Medical record saved for this visit.
        </div>
      )}

      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="empty-state-card">
          <h3>No medical records</h3>
          <p>Add a record during the current visit.</p>
        </div>
      ) : (
        <div className="record-timeline">
          {records.map((record) => (
            <article className="medical-record-card" key={record.id}>
              <div className="record-date">
                <strong>{new Date(record.visitDate).toLocaleDateString()}</strong>
                <span>
                  {encounterId &&
                  Number(record.encounterId) === Number(encounterId)
                    ? "Current visit"
                    : "Previous visit"}
                </span>
              </div>

              <div className="record-body">
                <div className="record-heading">
                  <div>
                    <span
                      className={
                        "status-badge " +
                        (encounterId &&
                        Number(record.encounterId) === Number(encounterId)
                          ? "status-active"
                          : "status-inactive")
                      }
                    >
                      {record.doctorName || "Clinical visit"}
                    </span>
                    <h3>{record.diagnosis}</h3>
                  </div>

                  {record.editable && (
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => openEditRecord(record)}
                    >
                      Edit
                    </button>
                  )}
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
                    <h4>Attachments</h4>
                  </div>

                  {record.attachments?.length ? (
                    <div className="prescription-list">
                      {record.attachments.map((item) => (
                        <div className="prescription-item" key={item.id}>
                          <div>
                            <strong>{item.fileName}</strong>
                            <span>
                              {item.mimeType} · {fileSize(item.fileSize)}
                            </span>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="button button-ghost button-small"
                              onClick={() => openAttachment(item)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="button button-ghost button-small"
                              onClick={() => downloadMedicalAttachment(item)}
                            >
                              Download
                            </button>
                            {record.editable && (
                              <button
                                type="button"
                                className="button button-ghost button-small"
                                onClick={() => revokeAttachment(record.id, item.id)}
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-note">No attachments.</p>
                  )}
                </div>

                <div className="prescription-section">
                  <div className="prescription-header">
                    <h4>Prescriptions</h4>
                    {record.editable && (
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => openNewPrescription(record.id)}
                      >
                        Add prescription
                      </button>
                    )}
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

                          {item.editable && (
                            <button
                              type="button"
                              className="button button-ghost button-small"
                              onClick={() => openEditPrescription(item)}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-note">No prescriptions.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showRecordForm && (
        <div className="modal-backdrop">
          <div className="modal modal-large clinical-form-modal">
            <div className="modal-header clinical-modal-header">
              <div>
                <span className="eyebrow">Medical record</span>
                <h2>{recordTarget ? "Edit clinical record" : "Add clinical record"}</h2>
                <p>Assessment, treatment and supporting documents.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowRecordForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitRecord} className="clinical-form">
              <div className="clinical-form-section">
                <div className="clinical-form-section-head">
                  <div>
                    <span>01</span>
                    <h3>Clinical assessment</h3>
                  </div>
                  <small>Diagnosis required</small>
                </div>

                <div className="clinical-form-grid">
                  <div className="field full">
                    <label htmlFor="record-diagnosis">Diagnosis</label>
                    <select
                      id="record-diagnosis"
                      className="input select-input"
                      value={diagnosisPreset}
                      onChange={(event) => handleDiagnosisPreset(event.target.value)}
                    >
                      <option value="">Select diagnosis</option>
                      {diagnosisOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {diagnosisPreset === "Other" && (
                      <input
                        className="input clinical-secondary-input"
                        value={recordForm.diagnosis}
                        onChange={(event) =>
                          setRecordForm({
                            ...recordForm,
                            diagnosis: event.target.value,
                          })
                        }
                        placeholder="Enter diagnosis"
                        required
                      />
                    )}
                  </div>

                  <div className="field full">
                    <label htmlFor="record-symptom-preset">Add common symptom</label>
                    <div className="field-inline">
                      <select
                        id="record-symptom-preset"
                        className="input select-input"
                        value={symptomPreset}
                        onChange={(event) => setSymptomPreset(event.target.value)}
                      >
                        <option value="">Select a symptom</option>
                        {symptomOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={addSymptom}
                        disabled={!symptomPreset}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="field full">
                    <label htmlFor="record-symptoms">Symptoms</label>
                    <textarea
                      id="record-symptoms"
                      className="textarea clinical-textarea"
                      value={recordForm.symptoms}
                      onChange={(event) =>
                        setRecordForm({
                          ...recordForm,
                          symptoms: event.target.value,
                        })
                      }
                      placeholder="Selected symptoms will appear here. Add any additional symptoms if needed."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="clinical-form-section">
                <div className="clinical-form-section-head">
                  <div>
                    <span>02</span>
                    <h3>Treatment & notes</h3>
                  </div>
                </div>

                <div className="clinical-form-grid">
                  <div className="field full">
                    <label htmlFor="record-treatment-preset">Treatment type</label>
                    <select
                      id="record-treatment-preset"
                      className="input select-input"
                      value={treatmentPreset}
                      onChange={(event) => handleTreatmentPreset(event.target.value)}
                    >
                      <option value="">Select treatment type</option>
                      {treatmentOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field full">
                    <label htmlFor="record-treatment">Treatment details</label>
                    <textarea
                      id="record-treatment"
                      className="textarea clinical-textarea"
                      value={recordForm.treatment}
                      onChange={(event) =>
                        setRecordForm({
                          ...recordForm,
                          treatment: event.target.value,
                        })
                      }
                      placeholder="Add treatment details, procedures, or follow-up instructions."
                      rows={4}
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="record-notes">Clinical notes</label>
                    <textarea
                      id="record-notes"
                      className="textarea clinical-textarea"
                      value={recordForm.notes}
                      onChange={(event) =>
                        setRecordForm({
                          ...recordForm,
                          notes: event.target.value,
                        })
                      }
                      placeholder="Optional notes for the medical record."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="clinical-form-section">
                <div className="clinical-form-section-head">
                  <div>
                    <span>03</span>
                    <h3>Attachments</h3>
                  </div>
                  <small>Optional · 10 MB per file</small>
                </div>

                <div className="field full">
                  <label htmlFor="record-attachments">Supporting documents</label>
                  <input
                    id="record-attachments"
                    className="input file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    multiple
                    onChange={(event) =>
                      selectAttachments(Array.from(event.target.files || []))
                    }
                  />
                  <small className="muted-note">JPG, PNG, WEBP or PDF.</small>

                  {attachmentFiles.length > 0 && (
                    <div className="prescription-list attachment-preview-list">
                      {attachmentFiles.map((file, index) => (
                        <div
                          className="prescription-item"
                          key={file.name + "-" + index}
                        >
                          <div>
                            <strong>{file.name}</strong>
                            <span>{fileSize(file.size)} · Ready to upload</span>
                          </div>
                          <button
                            type="button"
                            className="button button-ghost button-small"
                            onClick={() =>
                              setAttachmentFiles((current) =>
                                current.filter((_, i) => i !== index),
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="clinical-form-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowRecordForm(false)}
                >
                  Cancel
                </button>
                <button className="button button-primary" disabled={saving}>
                  {saving
                    ? "Saving…"
                    : recordTarget
                      ? "Save changes"
                      : "Save medical record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {preview && (
        <div
          className="modal-backdrop"
          onClick={() => {
            URL.revokeObjectURL(preview.url);
            setPreview(null);
          }}
        >
          <div
            className="modal modal-large"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{preview.name}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  URL.revokeObjectURL(preview.url);
                  setPreview(null);
                }}
              >
                ×
              </button>
            </div>
            <img
              src={preview.url}
              alt={preview.name}
              style={{ maxWidth: "100%", maxHeight: "70vh" }}
            />
          </div>
        </div>
      )}

      {(prescriptionRecordId || prescriptionTarget) && (
        <div className="modal-backdrop">
          <div className="modal prescription-modal">
            <div className="modal-header clinical-modal-header">
              <div>
                <span className="eyebrow">Medication</span>
                <h2>
                  {prescriptionTarget ? "Edit prescription" : "Add prescription"}
                </h2>
                <p>Use structured fields for a faster prescription.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setPrescriptionRecordId(null);
                  setPrescriptionTarget(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitPrescription} className="clinical-form">
              <div className="clinical-form-section">
                <div className="clinical-form-section-head">
                  <div>
                    <span>01</span>
                    <h3>Medicine</h3>
                  </div>
                </div>

                <div className="clinical-form-grid">
                  <div className="field full">
                    <label htmlFor="medicine-name">Medicine</label>
                    <select
                      id="medicine-name"
                      className="input select-input"
                      value={medicinePreset}
                      onChange={(event) =>
                        handleMedicinePreset(event.target.value)
                      }
                    >
                      <option value="">Select medicine</option>
                      {medicineOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {medicinePreset === "Other" && (
                      <input
                        className="input clinical-secondary-input"
                        value={prescriptionForm.medicineName}
                        onChange={(event) =>
                          setPrescriptionForm({
                            ...prescriptionForm,
                            medicineName: event.target.value,
                          })
                        }
                        placeholder="Enter medicine name"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="clinical-form-section">
                <div className="clinical-form-section-head">
                  <div>
                    <span>02</span>
                    <h3>Dose & schedule</h3>
                  </div>
                </div>

                <div className="clinical-form-grid three-columns">
                  <div className="field">
                    <label htmlFor="medicine-dosage">Dose</label>
                    <select
                      id="medicine-dosage"
                      className="input select-input"
                      value={dosagePreset}
                      onChange={(event) => handleDosagePreset(event.target.value)}
                    >
                      <option value="">Select dose</option>
                      {dosageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {dosagePreset === "Custom" && (
                      <input
                        className="input clinical-secondary-input"
                        value={prescriptionForm.dosage}
                        onChange={(event) =>
                          setPrescriptionForm({
                            ...prescriptionForm,
                            dosage: event.target.value,
                          })
                        }
                        placeholder="Enter dose"
                      />
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="medicine-frequency">Frequency</label>
                    <select
                      id="medicine-frequency"
                      className="input select-input"
                      value={prescriptionForm.frequency}
                      onChange={(event) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          frequency: event.target.value,
                        })
                      }
                    >
                      <option value="">Select frequency</option>
                      {frequencyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="medicine-duration">Duration</label>
                    <select
                      id="medicine-duration"
                      className="input select-input"
                      value={prescriptionForm.duration}
                      onChange={(event) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          duration: event.target.value,
                        })
                      }
                    >
                      <option value="">Select duration</option>
                      {durationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="clinical-form-section">
                <div className="clinical-form-section-head">
                  <div>
                    <span>03</span>
                    <h3>Instructions</h3>
                  </div>
                </div>

                <div className="clinical-form-grid">
                  <div className="field full">
                    <label htmlFor="medicine-instruction-preset">
                      Common instruction
                    </label>
                    <select
                      id="medicine-instruction-preset"
                      className="input select-input"
                      value={instructionPreset}
                      onChange={(event) =>
                        handleInstructionPreset(event.target.value)
                      }
                    >
                      <option value="">Select instruction</option>
                      {instructionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field full">
                    <label htmlFor="medicine-instructions">
                      Additional instructions
                    </label>
                    <textarea
                      id="medicine-instructions"
                      className="textarea clinical-textarea"
                      value={prescriptionForm.instructions}
                      onChange={(event) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          instructions: event.target.value,
                        })
                      }
                      placeholder="Add any additional instructions for the worker."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="clinical-form-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setPrescriptionRecordId(null);
                    setPrescriptionTarget(null);
                  }}
                >
                  Cancel
                </button>
                <button className="button button-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MedicalRecords;
