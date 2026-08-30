import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleLayout from "../components/RoleLayout";

const HospitalDashboard = () => {
  const { user } = useAuth(); const navigate = useNavigate();
  const actions = [
    { title: "Workers", text: "Register and manage worker profiles and QR identities.", path: "/hospital/workers", label: "Open workers", primary: true },
    { title: "Doctors", text: "Manage clinicians, roles and account status.", path: "/hospital/doctors", label: "Open doctors", primary: false },
    { title: "Scan worker QR", text: "Identify a worker quickly using their DHRMS card.", path: "/hospital/workers/scan", label: "Open scanner", primary: false },
    { title: "Find a worker", text: "Search for a worker using their unique worker ID.", path: "/hospital/find-worker", label: "Find worker", primary: false },
  ];
  return <RoleLayout title="Hospital dashboard" description={`Your DHRMS workspace for ${user?.email || "hospital staff"}.`}>
    <section className="dashboard-welcome"><div><span className="eyebrow">Today at a glance</span><h2>What would you like to do?</h2><p>Choose a workflow below. Detailed records stay inside their dedicated screens.</p></div><div className="dashboard-mark">H</div></section>
    <div className="workflow-grid">{actions.map((item) => <article className="workflow-card" key={item.path}><div className="workflow-card-top"><span className="role-icon">{item.title.charAt(0)}</span><span className="workflow-arrow">↗</span></div><h3>{item.title}</h3><p>{item.text}</p><button className={`button ${item.primary ? "button-primary" : "button-secondary"}`} onClick={() => navigate(item.path)}>{item.label}</button></article>)}</div>
    <div className="dashboard-note"><strong>Keep workflows focused.</strong><span>Use the worker directory for registration and QR actions, and open a worker profile when you need more detail.</span></div>
  </RoleLayout>;
};
export default HospitalDashboard;
