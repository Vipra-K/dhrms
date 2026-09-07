-- Keep worker ownership independent from doctor assignment so a newly
-- registered worker is immediately visible to the hospital before assignment.
ALTER TABLE "workers" ADD COLUMN "hospital_id" BIGINT;

ALTER TABLE "workers"
  ADD CONSTRAINT "workers_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_worker_hospital" ON "workers"("hospital_id");

-- Backfill ownership for existing workers where assignment history already
-- contains the hospital relationship. Unassigned legacy workers remain NULL.
UPDATE "workers" w
SET "hospital_id" = latest."hospital_id"
FROM (
  SELECT DISTINCT ON ("worker_id") "worker_id", "hospital_id"
  FROM "doctor_worker_assignments"
  ORDER BY "worker_id", "assigned_at" DESC
) latest
WHERE w."id" = latest."worker_id" AND w."hospital_id" IS NULL;

ALTER TABLE "doctor_worker_assignments" ADD COLUMN "ended_at" TIMESTAMP(3);

ALTER TABLE "medical_records"
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
