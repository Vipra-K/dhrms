DROP INDEX IF EXISTS "uk_doctor_worker_hospital";
CREATE INDEX IF NOT EXISTS "idx_assignment_doctor_worker_hospital" ON "doctor_worker_assignments"("doctor_id", "worker_id", "hospital_id");
