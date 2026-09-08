-- A worker may have only one active healthcare encounter at a time.
-- This is enforced at the database level as well as in the service to avoid
-- race conditions creating simultaneous hospital relationships.
CREATE UNIQUE INDEX "uq_encounter_worker_active"
ON "encounters" ("worker_id")
WHERE "status" = 'ACTIVE';
