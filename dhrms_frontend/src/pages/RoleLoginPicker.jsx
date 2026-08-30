import { useNavigate } from "react-router-dom";

const roles = [
  { label: "Hospital", description: "Manage doctors, workers and QR identification.", path: "/login/hospital" },
  { label: "Doctor", description: "Work with assigned workers and clinical records.", path: "/login/doctor" },
  { label: "Worker", description: "View your profile and medical history.", path: "/login/worker" },
];

const RoleLoginPicker = () => {
  const navigate = useNavigate();
  return <div className="auth-page role-picker-page"><main className="role-picker"><button className="auth-brand centered-brand" onClick={() => navigate("/")} type="button">DHRMS</button><span className="landing-pill">Secure portal access</span><h1>Choose your portal</h1><p>Only the tools and records relevant to your role will be shown.</p><div className="role-picker-grid">{roles.map((role) => <button key={role.label} className="role-picker-card" type="button" onClick={() => navigate(role.path)}><span className="role-icon">{role.label.charAt(0)}</span><span><strong>{role.label}</strong><small>{role.description}</small></span><b>→</b></button>)}</div><button className="button button-secondary button-full" onClick={() => navigate("/hospital/register")} type="button">Register a hospital</button></main></div>;
};

export default RoleLoginPicker;
