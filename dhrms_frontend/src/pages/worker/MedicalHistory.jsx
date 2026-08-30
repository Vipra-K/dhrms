import { useEffect, useState } from "react";
import api from "../../services/api";

const MedicalHistory = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await api.get("/workers/me/medical-records");

        setRecords(response.data);
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to load medical history",
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  if (loading) {
    return <p>Loading medical history...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Medical History</h1>

      {records.length === 0 ? (
        <p>No medical records found.</p>
      ) : (
        records.map((record) => (
          <div key={record.id}>
            <hr />

            <h2>Visit Date: {record.visitDate}</h2>

            <p>
              <strong>Hospital:</strong> {record.hospitalName}
            </p>

            <p>
              <strong>Doctor:</strong> {record.doctorName}
            </p>

            <p>
              <strong>Symptoms:</strong> {record.symptoms || "-"}
            </p>

            <p>
              <strong>Diagnosis:</strong> {record.diagnosis || "-"}
            </p>

            <p>
              <strong>Treatment:</strong> {record.treatment || "-"}
            </p>

            <p>
              <strong>Notes:</strong> {record.notes || "-"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default MedicalHistory;
