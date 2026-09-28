import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getAdminAnalytics } from "../services/adminService";
import { getApiError } from "../services/api";

const metricCards = [
  ["totalWorkers", "Total workers"],
  ["totalOfficers", "Registration officers"],
  ["totalHospitals", "Hospitals"],
  ["totalDoctors", "Doctors"],
  ["activeVisits", "Active visits"],
  ["totalMedicalRecords", "Medical records"],
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ district: "", hospitalId: "", officerId: "", from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      setData(await getAdminAnalytics(nextFilters));
    } catch (err) {
      setError(getApiError(err, "Unable to load system analytics."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, []);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const resetFilters = () => {
    const empty = { district: "", hospitalId: "", officerId: "", from: "", to: "" };
    setFilters(empty);
    load(empty);
  };

  const districts = useMemo(() => {
    const values = data?.workerByDistrict?.map((item) => item.district).filter((item) => item !== "Unknown") || [];
    return [...new Set(values)].sort();
  }, [data]);

  const workerOfficerTotal = useMemo(
    () => data?.workersByOfficer?.reduce((sum, item) => sum + item.workerCount, 0) || 0,
    [data]
  );

  const averagePerOfficer = data?.metrics?.totalOfficers
    ? (workerOfficerTotal / data.metrics.totalOfficers).toFixed(1)
    : "0.0";

  const maxDistrict = Math.max(...(data?.workerByDistrict?.map((item) => item.count) || [1]));
  const maxBlood = Math.max(...(data?.workerByBloodGroup?.map((item) => item.count) || [1]));
  const maxMonth = Math.max(...(data?.registrationsByMonth?.map((item) => item.count) || [1]));

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">D</div>
          <div><strong>DHRMS</strong><span>System Admin</span></div>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav-label">ADMINISTRATION</span>
          <div className="admin-nav-link active"><span>▦</span> Overview</div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">A</div>
            <div><strong>{user?.email || "System admin"}</strong><span>System administrator</span></div>
          </div>
          <button className="admin-logout" type="button" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">SYSTEM OVERVIEW</span>
            <h1>Analytics dashboard</h1>
          </div>
          <button className="admin-refresh" type="button" onClick={() => load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </header>

        {error && <div className="admin-alert">{error}</div>}

        <section className="admin-filters">
          <div className="admin-filter-heading">
            <div><strong>Filters</strong></div>
            <button type="button" onClick={resetFilters}>Reset</button>
          </div>
          <div className="admin-filter-grid">
            <label>District
              <select value={filters.district} onChange={(e) => setFilter("district", e.target.value)}>
                <option value="">All districts</option>
                {districts.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
            </label>
            <label>Hospital
              <select value={filters.hospitalId} onChange={(e) => setFilter("hospitalId", e.target.value)}>
                <option value="">All hospitals</option>
                {(data?.hospitalPerformance || []).map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name}</option>)}
              </select>
            </label>
            <label>Registration officer
              <select value={filters.officerId} onChange={(e) => setFilter("officerId", e.target.value)}>
                <option value="">All officers</option>
                {(data?.workersByOfficer || []).map((officer) => <option key={officer.id} value={officer.id}>{officer.email}</option>)}
              </select>
            </label>
            <label>From
              <input type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} />
            </label>
            <label>To
              <input type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} />
            </label>
            <button className="admin-apply" type="button" onClick={() => load(filters)} disabled={loading}>Apply filters</button>
          </div>
        </section>

        {data && <>
          <section className="admin-metric-grid">
            {metricCards.map(([key, label]) => (
              <article className="admin-metric" key={key}>
                <span>{label}</span>
                <strong>{data.metrics[key].toLocaleString()}</strong>
              </article>
            ))}
          </section>

          <section className="admin-grid-two">
            <article className="admin-card">
              <div className="admin-card-heading"><div><h2>Workers by district</h2></div></div>
              <div className="admin-bars">
                {data.workerByDistrict.length === 0 ? <div className="admin-empty">No worker data for this filter.</div> :
                  data.workerByDistrict.map((item) => <div className="admin-bar-row" key={item.district}><div><span>{item.district}</span><b>{item.count}</b></div><i><em style={{ width: (item.count / maxDistrict) * 100 + "%" }} /></i></div>)}
              </div>
            </article>

            <article className="admin-card">
              <div className="admin-card-heading"><div><h2>Blood group distribution</h2></div></div>
              <div className="admin-bars">
                {data.workerByBloodGroup.length === 0 ? <div className="admin-empty">No worker data for this filter.</div> :
                  data.workerByBloodGroup.map((item) => <div className="admin-bar-row" key={item.bloodGroup}><div><span>{item.bloodGroup}</span><b>{item.count}</b></div><i><em style={{ width: (item.count / maxBlood) * 100 + "%" }} /></i></div>)}
              </div>
            </article>
          </section>

          <section className="admin-card">
            <div className="admin-card-heading">
              <div><h2>Worker registrations</h2></div>
            </div>
            <div className="admin-months">
              {data.registrationsByMonth.length === 0 ? <div className="admin-empty">No registration history for this filter.</div> :
                data.registrationsByMonth.map((item) => <div className="admin-month" key={item.month}><div><b>{item.count}</b><span>{item.month}</span></div><i><em style={{ height: Math.max(8, (item.count / maxMonth) * 150) + "px" }} /></i></div>)}
            </div>
          </section>

          <section className="admin-grid-two">
            <article className="admin-card">
              <div className="admin-card-heading">
                <div><h2>Workers by registration officer</h2></div>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table"><thead><tr><th>Officer</th><th>Status</th><th>Workers</th></tr></thead><tbody>
                  {data.workersByOfficer.map((officer) => <tr key={officer.id}><td>{officer.email}</td><td><span className={officer.status === "ACTIVE" ? "admin-status active" : "admin-status"}>{officer.status}</span></td><td><strong>{officer.workerCount}</strong></td></tr>)}
                </tbody></table>
              </div>
            </article>

            <article className="admin-card">
              <div className="admin-card-heading"><div><h2>Hospital network</h2></div></div>
              <div className="admin-table-wrap">
                <table className="admin-table"><thead><tr><th>Hospital</th><th>Workers</th><th>Doctors</th><th>Visits</th></tr></thead><tbody>
                  {data.hospitalPerformance.map((hospital) => <tr key={hospital.id}><td><strong>{hospital.name}</strong><small>{hospital.district || "—"} · {hospital.code}</small></td><td>{hospital.workerCount}</td><td>{hospital.doctorCount}</td><td>{hospital.encounterCount}</td></tr>)}
                </tbody></table>
              </div>
            </article>
          </section>

          <div className="admin-footer-meta">Last updated {new Date(data.generatedAt).toLocaleString()}</div>
        </>}
      </main>
    </div>
  );
};

export default AdminDashboard;
