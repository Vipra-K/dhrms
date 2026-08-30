import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RoleLogin from "./pages/RoleLogin";
import Home from "./pages/Home";
import HospitalRegister from "./pages/HospitalRegister";
import HospitalDashboard from "./pages/HospitalDashboard";
import DoctorManagement from "./pages/hospital/DoctorManagement";
import ProtectedRoute from "./routes/ProtectedRoute";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import WorkerManagement from "./pages/hospital/WorkerManagement";
import WorkerQrScanner from "./pages/hospital/WorkerQrScanner";
import FindWorker from "./pages/hospital/FindWorker";
import WorkerProfile from "./pages/hospital/WorkerProfile";
import MyWorkers from "./pages/doctor/MyWorkers";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import MyProfile from "./pages/worker/MyProfile";
import MedicalHistory from "./pages/worker/MedicalHistory";
import DoctorWorkerProfile from "./pages/doctor/DoctorWorkerProfile";

const Protected = ({ role, children }) => <ProtectedRoute allowedRoles={[role]}>{children}</ProtectedRoute>;

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/hospital" element={<RoleLogin role="HOSPITAL" />} />
      <Route path="/login/doctor" element={<RoleLogin role="DOCTOR" />} />
      <Route path="/login/worker" element={<RoleLogin role="WORKER" />} />
      <Route path="/hospital/register" element={<HospitalRegister />} />

      <Route path="/hospital" element={<Protected role="HOSPITAL"><HospitalDashboard /></Protected>} />
      <Route path="/hospital/doctors" element={<Protected role="HOSPITAL"><DoctorManagement /></Protected>} />
      <Route path="/hospital/workers" element={<Protected role="HOSPITAL"><WorkerManagement /></Protected>} />
      <Route path="/hospital/workers/scan" element={<Protected role="HOSPITAL"><WorkerQrScanner /></Protected>} />
      <Route path="/hospital/find-worker" element={<Protected role="HOSPITAL"><FindWorker /></Protected>} />
      <Route path="/hospital/workers/:workerId" element={<Protected role="HOSPITAL"><WorkerProfile /></Protected>} />

      <Route path="/doctor" element={<Protected role="DOCTOR"><DoctorDashboard /></Protected>} />
      <Route path="/doctor/workers" element={<Protected role="DOCTOR"><MyWorkers /></Protected>} />
      <Route path="/doctor/workers/:workerId" element={<Protected role="DOCTOR"><DoctorWorkerProfile /></Protected>} />

      <Route path="/worker" element={<Protected role="WORKER"><WorkerDashboard /></Protected>} />
      <Route path="/worker/profile" element={<Protected role="WORKER"><MyProfile /></Protected>} />
      <Route path="/worker/medical-history" element={<Protected role="WORKER"><MedicalHistory /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
