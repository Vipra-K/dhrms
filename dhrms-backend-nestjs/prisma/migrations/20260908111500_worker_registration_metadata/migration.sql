ALTER TABLE "workers"
  ADD COLUMN "registered_by_id" BIGINT,
  ADD COLUMN "registration_status" VARCHAR(20) NOT NULL DEFAULT 'VERIFIED',
  ADD COLUMN "employer_name" VARCHAR(200),
  ADD COLUMN "worksite_name" VARCHAR(255),
  ADD COLUMN "worksite_address" VARCHAR(300),
  ADD COLUMN "worksite_district" VARCHAR(100),
  ADD COLUMN "job_role" VARCHAR(100);

ALTER TABLE "workers"
  ADD CONSTRAINT "workers_registered_by_id_fkey"
  FOREIGN KEY ("registered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_worker_registrar" ON "workers"("registered_by_id");
