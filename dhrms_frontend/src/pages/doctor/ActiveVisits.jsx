import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../../components/RoleLayout";
import { getDoctorActiveEncounters } from "../../services/encounterService";
import { getApiError } from "../../services/api";
import "./doctor-pages.css";

const ActiveVisits = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      setVisits(await getDoctorActiveEncounters());
    } catch (err) {
      setError(getApiError(err, "Unable to load active visits."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <RoleLayout
      title="Active visits"
      actions={[{ label: "Refresh", onClick: load, variant: "secondary", disabled: loading }]}
    >
      <div className="doctor-page">
        {error && <div className="alert error" role="alert">{error}</div>}

        <section className="page-card panel">
          <div className="toolbar">
            <h2>{visits.length} active visit{visits.length === 1 ? "" : "s"}</h2>
          </div>

          {loading ? (
            <div className="loading-card">Loading visits…</div>
          ) : visits.length === 0 ? (
            <div className="empty-state-card" style={{ marginTop: 18 }}>
              <h3>No active visits</h3>
            </div>
          ) : (
            <div className="table-card" style={{ marginTop: 18 }}>
              <table className="table">
                <thead><tr><th>Worker</th><th>Hospital</th><th>Started</th><th /></tr></thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.id}>
                      <td>
                        <div className="person-cell">
                          <span className="avatar">{(visit.workerName || "W").charAt(0).toUpperCase()}</span>
                          <div><strong>{visit.workerName}</strong><small>{visit.workerCode}</small></div>
                        </div>
                      </td>
                      <td>{visit.hospitalName || "—"}</td>
                      <td>{visit.startedAt ? new Date(visit.startedAt).toLocaleString() : "—"}</td>
                      <td><button className="button button-primary button-small" type="button" onClick={() => navigate(`/doctor/encounters/${visit.id}`)}>Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </RoleLayout>
  );
};

export default ActiveVisits;
