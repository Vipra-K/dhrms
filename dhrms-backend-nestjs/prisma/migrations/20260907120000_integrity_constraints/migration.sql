-- Enforce business invariants at the database layer.
CREATE UNIQUE INDEX IF NOT EXISTS "uq_hospitals_hospital_code"
ON "hospitals" ("hospital_code");

-- A worker may have only one current doctor assignment within a hospital,
-- while ended assignments remain available as immutable history.
CREATE UNIQUE INDEX IF NOT EXISTS "uq_active_assignment_per_worker_hospital"
ON "doctor_worker_assignments" ("worker_id", "hospital_id")
WHERE "active" = true;
