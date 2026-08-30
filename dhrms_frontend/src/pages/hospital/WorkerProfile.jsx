import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getWorker, assignWorkerToDoctor } from "../../services/workerService";

import { getHospitalDoctors } from "../../services/doctorService";

const WorkerProfile = () => {
  const { workerId } = useParams();

  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [doctors, setDoctors] = useState([]);

  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [assigning, setAssigning] = useState(false);
  const loadDoctors = async () => {
    try {
      const data = await getHospitalDoctors();

      setDoctors(data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load doctors");
    }
  };
  useEffect(() => {
    const loadWorker = async () => {
      try {
        const data = await getWorker(workerId);

        setWorker(data);
      } catch (error) {
        setError(error.response?.data?.error || "Failed to load worker");
      } finally {
        setLoading(false);
      }
    };

    loadWorker();
  }, [workerId]);
  const handleAssignDoctor = async () => {
    if (!selectedDoctorId) {
      setError("Please select a doctor");

      return;
    }

    setAssigning(true);
    setError("");

    try {
      await assignWorkerToDoctor(workerId, Number(selectedDoctorId));

      const updatedWorker = await getWorker(workerId);

      setWorker(updatedWorker);

      setSelectedDoctorId("");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to assign doctor");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <p>Loading worker...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={() => navigate("/hospital/find-worker")}>
          Back to Find Worker
        </button>
      </div>
    );
  }

  if (!worker) {
    return <p>Worker not found.</p>;
  }

  return (
    <div>
      <button onClick={() => navigate("/hospital/find-worker")}>← Back</button>

      <h1>Worker Profile</h1>

      <section>
        <h2>Basic Information</h2>

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

        <p>
          <strong>Status:</strong> {worker.active ? "ACTIVE" : "INACTIVE"}
        </p>
      </section>

      <hr />

      <section>
        <h2>Emergency Contact</h2>

        <p>
          <strong>Name:</strong> {worker.emergencyContactName || "-"}
        </p>

        <p>
          <strong>Phone:</strong> {worker.emergencyContactPhone || "-"}
        </p>

        <p>
          <strong>Relation:</strong> {worker.emergencyContactRelation || "-"}
        </p>
      </section>

      <hr />

      <hr />
      <section>
        <h2>Assigned Doctor</h2>

        {worker.assignedDoctorId ? (
          <>
            <p>
              <strong>Name:</strong> {worker.assignedDoctorName}
            </p>

            <p>
              <strong>Specialization:</strong>{" "}
              {worker.assignedDoctorSpecialization || "-"}
            </p>

            <button
              onClick={async () => {
                await loadDoctors();
              }}
            >
              Change Doctor
            </button>
          </>
        ) : (
          <p>No doctor assigned.</p>
        )}

        <div>
          <h3>
            {worker.assignedDoctorId
              ? "Assign / Reassign Doctor"
              : "Assign Doctor"}
          </h3>

          <select
            value={selectedDoctorId}
            onChange={(event) => setSelectedDoctorId(event.target.value)}
            onFocus={loadDoctors}
          >
            <option value="">Select Doctor</option>

            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullName}
                {doctor.specialization ? ` - ${doctor.specialization}` : ""}
              </option>
            ))}
          </select>

          <button onClick={handleAssignDoctor} disabled={assigning}>
            {assigning
              ? "Assigning..."
              : worker.assignedDoctorId
                ? "Reassign Doctor"
                : "Assign Doctor"}
          </button>
        </div>
      </section>
      <section>
        <h2>Medical Information</h2>

        <button
          onClick={() => {
            // Medical history comes next.
          }}
        >
          View Medical History
        </button>
      </section>
    </div>
  );
};

export default WorkerProfile;
