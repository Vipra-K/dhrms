CREATE TABLE "medical_record_attachments" (
  "id" BIGSERIAL NOT NULL,
  "medical_record_id" BIGINT NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "storage_path" VARCHAR(700) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "file_size" INTEGER NOT NULL,
  "uploaded_by_id" BIGINT NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  "revoked_at" TIMESTAMP(3),
  "revoked_by_id" BIGINT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "medical_record_attachments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "medical_record_attachments_storage_path_key" ON "medical_record_attachments"("storage_path");
CREATE INDEX "idx_medical_attachment_record_status" ON "medical_record_attachments"("medical_record_id", "status");
CREATE INDEX "idx_medical_attachment_uploader" ON "medical_record_attachments"("uploaded_by_id");

ALTER TABLE "medical_record_attachments" ADD CONSTRAINT "medical_record_attachments_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "medical_record_attachments" ADD CONSTRAINT "medical_record_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
