import { useEffect, useState } from "react";
import api from "../../services/api";

const MyProfile = () => {
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/workers/me");

        setWorker(response.data);
      } catch (error) {
        setError(error.response?.data?.error || "Failed to load profile");
      }
    };

    loadProfile();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!worker) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h1>My Profile</h1>

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
    </div>
  );
};

export default MyProfile;
