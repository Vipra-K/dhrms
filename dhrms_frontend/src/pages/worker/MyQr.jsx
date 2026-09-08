import { useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkerQr } from "../../services/workerService";
import { getApiError } from "../../services/api";

const MyQr = () => {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (refresh = false) => {
    try {
      setError("");
      if (refresh) setRefreshing(true); else setLoading(true);
      setQr(await getMyWorkerQr());
    } catch (err) {
      setError(getApiError(err, "Unable to load your worker QR code."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const download = () => {
    if (!qr?.qrImage) return;
    const link = document.createElement("a");
    link.href = qr.qrImage;
    link.download = `${qr.workerCode || "worker"}-dhrms-qr.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <RoleLayout title="My QR"><div className="loading-card">Preparing your worker identity QR…</div></RoleLayout>;
  if (error) return <RoleLayout title="My QR"><div className="alert error" role="alert">{error}</div><button className="button button-primary" type="button" onClick={() => load()}>Try again</button></RoleLayout>;

  return (
    <RoleLayout title="Worker QR identity" description="Use your DHRMS QR code when an authorized hospital needs to identify your worker record.">
      <div className="worker-qr-layout">
        <section className="panel worker-qr-card">
          <div className="worker-qr-header"><div><span className="eyebrow">Verified identity</span><h2>{qr.workerCode || "Worker ID"}</h2><p>Present this code to authorized DHRMS hospital staff during registration or care.</p></div><span className="worker-verified-badge">● Verified</span></div>
          <div className="worker-qr-frame"><img src={qr.qrImage} alt="Your DHRMS worker QR code" width="360" height="360" /></div>
          <div className="worker-qr-actions">
            <button className="button button-primary" type="button" onClick={download}><span aria-hidden="true">↓</span> Download QR</button>
            <button className="button button-secondary worker-icon-button" type="button" onClick={() => load(true)} disabled={refreshing} aria-label="Refresh QR code" title="Refresh QR code"><span aria-hidden="true">↻</span></button>
          </div>
        </section>

        <aside className="worker-qr-info">
          <div className="panel worker-info-card"><span className="worker-info-icon">1</span><div><strong>Show, don't share</strong><p>Use the code in person with authorized hospital staff. Avoid posting screenshots publicly.</p></div></div>
          <div className="panel worker-info-card"><span className="worker-info-icon">2</span><div><strong>One verified identity</strong><p>Your QR identifies your DHRMS worker record; it does not expose your clinical history.</p></div></div>
          <div className="panel worker-info-card"><span className="worker-info-icon">3</span><div><strong>Need help?</strong><p>If the code cannot be recognized, contact your hospital or registration officer.</p></div></div>
        </aside>
      </div>
    </RoleLayout>
  );
};

export default MyQr;
