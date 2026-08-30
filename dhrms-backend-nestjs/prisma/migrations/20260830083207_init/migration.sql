-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(30) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hfr_facilities" (
    "id" BIGSERIAL NOT NULL,
    "hfr_id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "hfr_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "hfr_facility_id" BIGINT NOT NULL,
    "hospital_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(300),
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "phone" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "hospital_id" BIGINT NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "specialization" VARCHAR(150),
    "license_number" VARCHAR(100),
    "department" VARCHAR(100),
    "role" VARCHAR(30) NOT NULL DEFAULT 'JUNIOR_DOCTOR',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "working_hours_start" VARCHAR(10),
    "working_hours_end" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "worker_code" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "date_of_birth" DATE,
    "gender" VARCHAR(20),
    "blood_group" VARCHAR(10),
    "phone" VARCHAR(20),
    "address" VARCHAR(300),
    "emergency_contact_name" VARCHAR(150),
    "emergency_contact_phone" VARCHAR(20),
    "emergency_contact_relation" VARCHAR(50),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_worker_assignments" (
    "id" BIGSERIAL NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "worker_id" BIGINT NOT NULL,
    "hospital_id" BIGINT NOT NULL,
    "assigned_by" BIGINT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "doctor_worker_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" BIGSERIAL NOT NULL,
    "worker_id" BIGINT NOT NULL,
    "hospital_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "visit_date" DATE NOT NULL,
    "symptoms" VARCHAR(2000),
    "diagnosis" VARCHAR(2000) NOT NULL,
    "treatment" VARCHAR(3000),
    "notes" VARCHAR(5000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" BIGSERIAL NOT NULL,
    "medical_record_id" BIGINT NOT NULL,
    "worker_id" BIGINT NOT NULL,
    "doctor_id" BIGINT NOT NULL,
    "medicine_name" VARCHAR(200) NOT NULL,
    "dosage" VARCHAR(100),
    "frequency" VARCHAR(100),
    "duration" VARCHAR(100),
    "instructions" VARCHAR(1000),
    "file_path" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_qr_codes" (
    "id" BIGSERIAL NOT NULL,
    "worker_id" BIGINT NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "qr_content" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "worker_qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hfr_facilities_hfr_id_key" ON "hfr_facilities"("hfr_id");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_user_id_key" ON "hospitals"("user_id");

-- CreateIndex
CREATE INDEX "idx_hospital_code" ON "hospitals"("hospital_code");

-- CreateIndex
CREATE INDEX "idx_hospital_hfr_id" ON "hospitals"("hfr_facility_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_user_id_key" ON "doctors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_license_number_key" ON "doctors"("license_number");

-- CreateIndex
CREATE INDEX "idx_doctor_license" ON "doctors"("license_number");

-- CreateIndex
CREATE INDEX "idx_doctor_hospital" ON "doctors"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "workers_user_id_key" ON "workers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workers_worker_code_key" ON "workers"("worker_code");

-- CreateIndex
CREATE INDEX "idx_worker_code" ON "workers"("worker_code");

-- CreateIndex
CREATE INDEX "idx_worker_name" ON "workers"("full_name");

-- CreateIndex
CREATE INDEX "idx_assignment_doctor" ON "doctor_worker_assignments"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_assignment_worker" ON "doctor_worker_assignments"("worker_id");

-- CreateIndex
CREATE INDEX "idx_assignment_hospital" ON "doctor_worker_assignments"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_doctor_worker_hospital" ON "doctor_worker_assignments"("doctor_id", "worker_id", "hospital_id");

-- CreateIndex
CREATE INDEX "idx_medical_record_worker" ON "medical_records"("worker_id");

-- CreateIndex
CREATE INDEX "idx_medical_record_doctor" ON "medical_records"("doctor_id");

-- CreateIndex
CREATE INDEX "idx_medical_record_hospital" ON "medical_records"("hospital_id");

-- CreateIndex
CREATE INDEX "idx_medical_record_visit_date" ON "medical_records"("visit_date");

-- CreateIndex
CREATE INDEX "idx_prescription_record" ON "prescriptions"("medical_record_id");

-- CreateIndex
CREATE INDEX "idx_prescription_worker" ON "prescriptions"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_qr_codes_worker_id_key" ON "worker_qr_codes"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_qr_codes_token_hash_key" ON "worker_qr_codes"("token_hash");

-- AddForeignKey
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_hfr_facility_id_fkey" FOREIGN KEY ("hfr_facility_id") REFERENCES "hfr_facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_worker_assignments" ADD CONSTRAINT "doctor_worker_assignments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_worker_assignments" ADD CONSTRAINT "doctor_worker_assignments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_worker_assignments" ADD CONSTRAINT "doctor_worker_assignments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_qr_codes" ADD CONSTRAINT "worker_qr_codes_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
