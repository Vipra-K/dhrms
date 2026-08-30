import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMyWorker } from "../../services/workerService";
import MedicalRecords from "./MedicalRecords";
const DoctorWorkerProfile = () => {
  const { workerId } = useParams();

  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadWorker = async () => {
      try {
        const data = await getMyWorker(workerId);

        setWorker(data);
      } catch (error) {
        setError(
          error.response?.data?.error ||
            "You are not authorized to access this worker",
        );
      } finally {
        setLoading(false);
      }
    };

    loadWorker();
  }, [workerId]);

  if (loading) {
    return <p>Loading worker...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={() => navigate("/doctor/workers")}>
          Back to My Workers
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate("/doctor/workers")}>← My Workers</button>

      <h1>Worker Profile</h1>

      <p>
        <strong>Worker ID:</strong> {worker.workerCode}
      </p>

      <p>
        <strong>Name:</strong> {worker.fullName}
      </p>

      <p>
        <strong>Date of Birth:</strong> {worker.dateOfBirth || "-"}
      </p>

      <p>
        <strong>Gender:</strong> {worker.gender || "-"}
      </p>

      <p>
        <strong>Blood Group:</strong> {worker.bloodGroup || "-"}
      </p>

      <p>
        <strong>Phone:</strong> {worker.phone || "-"}
      </p>

      <p>
        <strong>Address:</strong> {worker.address || "-"}
      </p>

      <hr />

      <MedicalRecords workerId={workerId} />
    </div>
  );
};

export default DoctorWorkerProfile;
