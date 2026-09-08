-- Introduce encounter-based healthcare relationships.
-- Existing worker/hospital ownership and doctor assignment data are intentionally
-- retained for backward-compatible migration; new flows should use encounters.

CREATE TABLE "encounters" (
  "id" BIGSERIAL NOT NULL,
  "worker_id" BIGINT NOT NULL,
  "hospital_id" BIGINT NOT NULL,
  "doctor_id" BIGINT NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "medical_records" ADD COLUMN "encounter_id" BIGINT;

ALTER TABLE "encounters"
  ADD CONSTRAINT "encounters_worker_id_fkey"
  FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "encounters"
  ADD CONSTRAINT "encounters_hospital_id_fkey"
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "encounters"
  ADD CONSTRAINT "encounters_doctor_id_fkey"
  FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "medical_records"
  ADD CONSTRAINT "medical_records_encounter_id_fkey"
  FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_encounter_worker_status" ON "encounters"("worker_id", "status");
CREATE INDEX "idx_encounter_hospital_status" ON "encounters"("hospital_id", "status");
CREATE INDEX "idx_encounter_doctor_status" ON "encounters"("doctor_id", "status");
CREATE INDEX "idx_encounter_started_at" ON "encounters"("started_at");
CREATE INDEX "idx_medical_record_encounter" ON "medical_records"("encounter_id");
