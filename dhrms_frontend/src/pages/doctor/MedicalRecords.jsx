import { useEffect, useState } from "react";
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord, createPrescription, updatePrescription } from "../../services/medicalService";
import { getApiError } from "../../services/api";

const blankRecord = { visitDate: "", symptoms: "", diagnosis: "", treatment: "", notes: "" };
const blankPrescription = { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" };
const dateOnly = (value) => value ? String(value).slice(0, 10) : "";

const MedicalRecords = ({ workerId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recordForm, setRecordForm] = useState(blankRecord);
  const [prescriptionForm, setPrescriptionForm] = useState(blankPrescription);
  const [recordTarget, setRecordTarget] = useState(null);
  const [prescriptionTarget, setPrescriptionTarget] = useState(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [prescriptionRecordId, setPrescriptionRecordId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchRecords = async () => {
      try {
        const data = await getMedicalRecords(workerId);
        if (!ignore) {
          setRecords(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiError(err, "Unable to load medical records."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchRecords();
    return () => {
      ignore = true;
    };
  }, [workerId]);

  const submitRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = recordTarget ? await updateMedicalRecord(recordTarget.id, recordForm) : await createMedicalRecord(workerId, recordForm);
      setRecords((current) => recordTarget ? current.map((r) => r.id === saved.id ? saved : r) : [saved, ...current]);
      setRecordForm(blankRecord);
      setRecordTarget(null);
      setShowRecordForm(false);
    } catch (err) {
      setError(getApiError(err, "Unable to save medical record."));
    } finally {
      setSaving(false);
    }
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = prescriptionTarget ? await updatePrescription(prescriptionTarget.id, prescriptionForm) : await createPrescription(prescriptionRecordId, prescriptionForm);
      setRecords((current) => current.map((record) => {
        const targetId = prescriptionTarget?.medicalRecordId || prescriptionRecordId;
        if (record.id !== targetId) return record;
        const prescriptions = prescriptionTarget ? record.prescriptions.map((p) => p.id === saved.id ? saved : p) : [...(record.prescriptions || []), saved];
        return { ...record, prescriptions };
      }));
      setPrescriptionForm(blankPrescription);
      setPrescriptionTarget(null);
      setPrescriptionRecordId(null);
    } catch (err) {
      setError(getApiError(err, "Unable to save prescription."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-card">Loading medical history…</div>;
  return <section className="medical-records-section">
    <div className="section-toolbar"><div><span className="eyebrow">Clinical history</span><h2>Medical records</h2><p>{records.length} visit{records.length === 1 ? "" : "s"}. Previous doctors' records are readable but not silently editable.</p></div><button className="button button-primary" onClick={() => { setRecordTarget(null); setRecordForm({ ...blankRecord, visitDate: new Date().toISOString().slice(0, 10) }); setShowRecordForm(true); }}>+ Add visit</button></div>
    {error && <div className="alert error" role="alert">{error}</div>}
    {records.length === 0 ? <div className="empty-state-card"><h3>No medical records yet</h3><p>Add the first clinical visit for this worker.</p></div> : <div className="record-timeline">{records.map((record) => <article className="medical-record-card" key={record.id}><div className="record-date"><strong>{new Date(record.visitDate).toLocaleDateString()}</strong><span>Visit</span></div><div className="record-body"><div className="record-heading"><div><span className="status-badge status-active">{record.doctorName || "Clinical visit"}</span><h3>{record.diagnosis}</h3></div>{record.editable && <button className="button button-ghost button-small" onClick={() => { setRecordTarget(record); setRecordForm({ visitDate: dateOnly(record.visitDate), symptoms: record.symptoms || "", diagnosis: record.diagnosis || "", treatment: record.treatment || "", notes: record.notes || "" }); setShowRecordForm(true); }}>Edit</button>}</div><div className="record-fields"><div><small>Symptoms</small><p>{record.symptoms || "—"}</p></div><div><small>Treatment</small><p>{record.treatment || "—"}</p></div><div><small>Notes</small><p>{record.notes || "—"}</p></div></div><div className="prescription-section"><div className="prescription-header"><h4>Prescriptions</h4>{record.editable && <button className="button button-secondary button-small" onClick={() => { setPrescriptionTarget(null); setPrescriptionForm(blankPrescription); setPrescriptionRecordId(record.id); }}>+ Add prescription</button>}</div>{record.prescriptions?.length ? <div className="prescription-list">{record.prescriptions.map((item) => <div className="prescription-item" key={item.id}><div><strong>{item.medicineName}</strong><span>{[item.dosage, item.frequency, item.duration].filter(Boolean).join(" · ") || "No dosage details"}</span>{item.instructions && <small>{item.instructions}</small>}</div>{item.editable && <button className="button button-ghost button-small" onClick={() => { setPrescriptionTarget(item); setPrescriptionForm({ medicineName: item.medicineName || "", dosage: item.dosage || "", frequency: item.frequency || "", duration: item.duration || "", instructions: item.instructions || "" }); }}>Edit</button>}</div>)}</div> : <p className="muted-note">No prescriptions for this visit.</p>}</div></div></article>)}</div>}

    {showRecordForm && <div className="modal-backdrop"><div className="modal modal-large"><div className="modal-header"><div><span className="eyebrow">{recordTarget ? "Update visit" : "New visit"}</span><h2>{recordTarget ? "Edit medical record" : "Add medical record"}</h2></div><button className="modal-close" onClick={() => setShowRecordForm(false)} aria-label="Close">×</button></div><form onSubmit={submitRecord} className="form-grid"><div className="field"><label>Visit date</label><input className="input" type="date" value={recordForm.visitDate} onChange={(e) => setRecordForm({ ...recordForm, visitDate: e.target.value })} required /></div><div className="field"><label>Diagnosis</label><input className="input" value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} required /></div><div className="field full"><label>Symptoms</label><textarea className="textarea" value={recordForm.symptoms} onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })} /></div><div className="field full"><label>Treatment</label><textarea className="textarea" value={recordForm.treatment} onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })} /></div><div className="field full"><label>Notes</label><textarea className="textarea" value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} /></div><div className="field full"><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowRecordForm(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save record"}</button></div></div></form></div></div>}
    {(prescriptionRecordId || prescriptionTarget) && <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><span className="eyebrow">Medication</span><h2>{prescriptionTarget ? "Edit prescription" : "Add prescription"}</h2></div><button className="modal-close" onClick={() => { setPrescriptionRecordId(null); setPrescriptionTarget(null); }} aria-label="Close">×</button></div><form onSubmit={submitPrescription} className="form-grid"><div className="field full"><label>Medicine name</label><input className="input" value={prescriptionForm.medicineName} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicineName: e.target.value })} required /></div><div className="field"><label>Dosage</label><input className="input" value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })} /></div><div className="field"><label>Frequency</label><input className="input" value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })} /></div><div className="field"><label>Duration</label><input className="input" value={prescriptionForm.duration} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })} /></div><div className="field full"><label>Instructions</label><textarea className="textarea" value={prescriptionForm.instructions} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })} /></div><div className="field full"><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => { setPrescriptionRecordId(null); setPrescriptionTarget(null); }}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save prescription"}</button></div></div></form></div></div>}
  </section>;
};

export default MedicalRecords;
