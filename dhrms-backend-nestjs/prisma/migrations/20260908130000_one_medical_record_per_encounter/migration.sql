-- A clinical encounter may have exactly one medical record.
-- Keep encounterId nullable for legacy records, but enforce uniqueness for
-- every record created through the current encounter-based flow.
CREATE UNIQUE INDEX "uq_medical_record_encounter"
ON "medical_records" ("encounter_id");
