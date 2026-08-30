ALTER TABLE "doctors"
ADD COLUMN IF NOT EXISTS "working_hours_start" VARCHAR(10),
ADD COLUMN IF NOT EXISTS "working_hours_end" VARCHAR(10);
