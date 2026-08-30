import { useEffect, useState } from "react";

import {
  getMedicalRecords,
  createMedicalRecord,
  deleteMedicalRecord,
  createPrescription,
  deletePrescription,
} from "../../services/medicalService";

const MedicalRecords = ({ workerId }) => {
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showRecordForm, setShowRecordForm] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState(null);

  const [recordForm, setRecordForm] = useState({
    visitDate: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  const loadRecords = async () => {
    try {
      setError("");

      const data = await getMedicalRecords(workerId);

      setRecords(data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [workerId]);

  const handleRecordChange = (event) => {
    setRecordForm({
      ...recordForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateRecord = async (event) => {
    event.preventDefault();

    try {
      await createMedicalRecord(workerId, recordForm);

      setRecordForm({
        visitDate: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        notes: "",
      });

      setShowRecordForm(false);

      await loadRecords();
    } catch (error) {
      setError(
        error.response?.data?.error || "Failed to create medical record",
      );
    }
  };

  const handleDeleteRecord = async (recordId) => {
    const confirmed = window.confirm(
      "Delete this medical record and its prescriptions?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMedicalRecord(recordId);

      await loadRecords();
    } catch (error) {
      setError(
        error.response?.data?.error || "Failed to delete medical record",
      );
    }
  };

  const handlePrescriptionChange = (event) => {
    setPrescriptionForm({
      ...prescriptionForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreatePrescription = async (event) => {
    event.preventDefault();

    if (!selectedRecord) {
      return;
    }

    try {
      await createPrescription(selectedRecord.id, prescriptionForm);

      setPrescriptionForm({
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });

      setShowPrescriptionForm(false);

      await loadRecords();

      const updatedRecords = await getMedicalRecords(workerId);

      const updatedRecord = updatedRecords.find(
        (record) => record.id === selectedRecord.id,
      );

      setSelectedRecord(updatedRecord || null);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create prescription");
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    const confirmed = window.confirm("Delete this prescription?");

    if (!confirmed) {
      return;
    }

    try {
      await deletePrescription(prescriptionId);

      await loadRecords();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete prescription");
    }
  };

  if (loading) {
    return <p>Loading medical records...</p>;
  }

  return (
    <section>
      <h2>Medical History</h2>

      {error && <p>{error}</p>}

      <button onClick={() => setShowRecordForm(!showRecordForm)}>
        {showRecordForm ? "Cancel" : "Add Medical Record"}
      </button>

      {showRecordForm && (
        <form onSubmit={handleCreateRecord}>
          <h3>New Medical Record</h3>

          <input
            type="date"
            name="visitDate"
            value={recordForm.visitDate}
            onChange={handleRecordChange}
            required
          />

          <textarea
            name="symptoms"
            placeholder="Symptoms"
            value={recordForm.symptoms}
            onChange={handleRecordChange}
          />

          <textarea
            name="diagnosis"
            placeholder="Diagnosis"
            value={recordForm.diagnosis}
            onChange={handleRecordChange}
            required
          />

          <textarea
            name="treatment"
            placeholder="Treatment"
            value={recordForm.treatment}
            onChange={handleRecordChange}
          />

          <textarea
            name="notes"
            placeholder="Notes"
            value={recordForm.notes}
            onChange={handleRecordChange}
          />

          <button type="submit">Save Medical Record</button>
        </form>
      )}

      {records.length === 0 ? (
        <p>No medical records found.</p>
      ) : (
        records.map((record) => (
          <article key={record.id}>
            <hr />

            <h3>Visit: {record.visitDate}</h3>

            <p>
              <strong>Symptoms:</strong> {record.symptoms || "-"}
            </p>

            <p>
              <strong>Diagnosis:</strong> {record.diagnosis}
            </p>

            <p>
              <strong>Treatment:</strong> {record.treatment || "-"}
            </p>

            <p>
              <strong>Notes:</strong> {record.notes || "-"}
            </p>

            <button onClick={() => handleDeleteRecord(record.id)}>
              Delete Record
            </button>

            <h4>Prescriptions</h4>

            {record.prescriptions?.length === 0 ? (
              <p>No prescriptions.</p>
            ) : (
              record.prescriptions?.map((prescription) => (
                <div key={prescription.id}>
                  <p>
                    <strong>Medicine:</strong> {prescription.medicineName}
                  </p>

                  <p>
                    <strong>Dosage:</strong> {prescription.dosage || "-"}
                  </p>

                  <p>
                    <strong>Frequency:</strong> {prescription.frequency || "-"}
                  </p>

                  <p>
                    <strong>Duration:</strong> {prescription.duration || "-"}
                  </p>

                  <p>
                    <strong>Instructions:</strong>{" "}
                    {prescription.instructions || "-"}
                  </p>

                  <button
                    onClick={() => handleDeletePrescription(prescription.id)}
                  >
                    Delete Prescription
                  </button>
                </div>
              ))
            )}

            <button
              onClick={() => {
                setSelectedRecord(record);

                setShowPrescriptionForm(true);
              }}
            >
              Add Prescription
            </button>
          </article>
        ))
      )}

      {showPrescriptionForm && selectedRecord && (
        <form onSubmit={handleCreatePrescription}>
          <hr />

          <h3>Add Prescription</h3>

          <p>Medical Record: {selectedRecord.id}</p>

          <input
            type="text"
            name="medicineName"
            placeholder="Medicine name"
            value={prescriptionForm.medicineName}
            onChange={handlePrescriptionChange}
            required
          />

          <input
            type="text"
            name="dosage"
            placeholder="Dosage"
            value={prescriptionForm.dosage}
            onChange={handlePrescriptionChange}
          />

          <input
            type="text"
            name="frequency"
            placeholder="Frequency"
            value={prescriptionForm.frequency}
            onChange={handlePrescriptionChange}
          />

          <input
            type="text"
            name="duration"
            placeholder="Duration"
            value={prescriptionForm.duration}
            onChange={handlePrescriptionChange}
          />

          <textarea
            name="instructions"
            placeholder="Instructions"
            value={prescriptionForm.instructions}
            onChange={handlePrescriptionChange}
          />

          <button type="submit">Save Prescription</button>

          <button
            type="button"
            onClick={() => {
              setShowPrescriptionForm(false);

              setSelectedRecord(null);
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </section>
  );
};

export default MedicalRecords;
