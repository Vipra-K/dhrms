import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/hospital/find-worker"
          element={
            <ProtectedRoute allowedRoles={["HOSPITAL"]}>
              <FindWorker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker"
          element={
            <ProtectedRoute allowedRoles={["WORKER"]}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/worker/profile"
          element={
            <ProtectedRoute allowedRoles={["WORKER"]}>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/worker/medical-history"
          element={
            <ProtectedRoute allowedRoles={["WORKER"]}>
              <MedicalHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/workers/:workerId"
          element={
            <ProtectedRoute allowedRoles={["HOSPITAL"]}>
              <WorkerProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/hospital/doctors"
          element={
            <ProtectedRoute allowedRoles={["HOSPITAL"]}>
              <DoctorManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/workers"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <MyWorkers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/workers/:workerId"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorWorkerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/workers/scan"
          element={
            <ProtectedRoute allowedRoles={["HOSPITAL"]}>
              <WorkerQrScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/workers"
          element={
            <ProtectedRoute allowedRoles={["HOSPITAL"]}>
              <WorkerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />

        <Route path="/hospital/register" element={<HospitalRegister />} />

        <Route
          path="/hospital"
          element={
            <ProtectedRoute allowedRoles={["HOSPITAL"]}>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
