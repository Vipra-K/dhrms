import { useEffect, useState } from "react";
import RoleLayout from "../../components/RoleLayout";
import { getMyWorkerQr } from "../../services/workerService";
import { getApiError } from "../../services/api";

const MyQr = () => {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      setQr(await getMyWorkerQr());
    } catch (err) {
      setError(getApiError(err, "Unable to load your QR code."));
    } finally {
      setLoading(false);
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

  if (loading) return <RoleLayout title="My QR"><div className="loading-card">Loading your QR code…</div></RoleLayout>;
  if (error) return <RoleLayout title="My QR"><div className="alert error" role="alert">{error}</div><button className="button button-primary" type="button" onClick={load}>Try again</button></RoleLayout>;

  return (
    <RoleLayout title="My QR" description="Show this QR code at a DHRMS hospital when you need to be identified.">
      <div className="panel" style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <span className="eyebrow">Worker identity</span>
        <h2>{qr.workerCode}</h2>
        <div style={{ display: "flex", justifyContent: "center", margin: "28px 0" }}>
          <img src={qr.qrImage} alt="Your DHRMS worker QR code" width="360" height="360" style={{ maxWidth: "100%", height: "auto", background: "white", padding: 16, borderRadius: 12 }} />
        </div>
        <p className="muted-note">Hospitals use this code to identify your worker record. Do not share screenshots publicly.</p>
        <div className="modal-actions" style={{ justifyContent: "center", marginTop: 20 }}>
          <button className="button button-primary" type="button" onClick={download}>Download QR</button>
          <button className="button button-secondary" type="button" onClick={load}>Refresh</button>
        </div>
      </div>
    </RoleLayout>
  );
};

export default MyQr;
