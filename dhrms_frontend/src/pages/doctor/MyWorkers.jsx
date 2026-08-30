import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyWorkers } from "../../services/doctorService";

const MyWorkers = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const data = await getMyWorkers();

        setWorkers(data);
      } catch (error) {
        setError(error.response?.data?.error || "Failed to load workers");
      } finally {
        setLoading(false);
      }
    };

    loadWorkers();
  }, []);

  if (loading) {
    return <p>Loading workers...</p>;
  }

  return (
    <div>
      <h1>My Workers</h1>

      {error && <p>{error}</p>}

      {workers.length === 0 ? (
        <p>No workers assigned to you.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Worker ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {workers.map((worker) => (
              <tr key={worker.workerId}>
                <td>{worker.workerCode}</td>

                <td>{worker.fullName}</td>

                <td>{worker.gender || "-"}</td>

                <td>{worker.bloodGroup || "-"}</td>

                <td>{worker.phone || "-"}</td>

                <td>
                  <button
                    onClick={() =>
                      navigate(`/doctor/workers/${worker.workerId}`)
                    }
                  >
                    View Worker
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyWorkers;
