package com.dhrms.dhrms_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhrms.dhrms_backend.dto.medical.MedicalRecordRequest;
import com.dhrms.dhrms_backend.dto.medical.MedicalRecordResponse;
import com.dhrms.dhrms_backend.dto.medical.PrescriptionRequest;
import com.dhrms.dhrms_backend.dto.medical.PrescriptionResponse;
import com.dhrms.dhrms_backend.entity.Doctor;
import com.dhrms.dhrms_backend.entity.Hospital;
import com.dhrms.dhrms_backend.entity.MedicalRecord;
import com.dhrms.dhrms_backend.entity.Prescription;
import com.dhrms.dhrms_backend.entity.Worker;
import com.dhrms.dhrms_backend.repository.DoctorRepository;
import com.dhrms.dhrms_backend.repository.DoctorWorkerAssignmentRepository;
import com.dhrms.dhrms_backend.repository.HospitalRepository;
import com.dhrms.dhrms_backend.repository.MedicalRecordRepository;
import com.dhrms.dhrms_backend.repository.PrescriptionRepository;
import com.dhrms.dhrms_backend.repository.WorkerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;

    private final PrescriptionRepository prescriptionRepository;

    private final DoctorRepository doctorRepository;

    private final WorkerRepository workerRepository;

    private final HospitalRepository hospitalRepository;

    private final DoctorWorkerAssignmentRepository assignmentRepository;

    // =========================================================
    // MEDICAL RECORDS
    // =========================================================

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getWorkerMedicalRecords(
            Long doctorUserId,
            Long workerId) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        verifyWorkerAccess(
                doctor,
                workerId);

        return medicalRecordRepository
                .findByWorker_IdAndDoctor_IdOrderByVisitDateDesc(
                        workerId,
                        doctor.getId())
                .stream()
                .map(this::toMedicalRecordResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecord(
            Long doctorUserId,
            Long recordId) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        MedicalRecord record = medicalRecordRepository
                .findByIdAndDoctor_Id(
                        recordId,
                        doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Medical record not found"));

        verifyWorkerAccess(
                doctor,
                record.getWorker().getId());

        return toMedicalRecordResponse(record);
    }

    @Transactional
    public MedicalRecordResponse createMedicalRecord(
            Long doctorUserId,
            Long workerId,
            MedicalRecordRequest request) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        verifyWorkerAccess(
                doctor,
                workerId);

        Worker worker = workerRepository
                .findById(workerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Worker not found"));

        Hospital hospital = doctor.getHospital();

        MedicalRecord record = MedicalRecord.builder()
                .worker(worker)
                .doctor(doctor)
                .hospital(hospital)
                .visitDate(request.getVisitDate())
                .symptoms(request.getSymptoms())
                .diagnosis(request.getDiagnosis())
                .treatment(request.getTreatment())
                .notes(request.getNotes())
                .build();

        record = medicalRecordRepository.save(record);

        return toMedicalRecordResponse(record);
    }

    @Transactional
    public MedicalRecordResponse updateMedicalRecord(
            Long doctorUserId,
            Long recordId,
            MedicalRecordRequest request) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        MedicalRecord record = medicalRecordRepository
                .findByIdAndDoctor_Id(
                        recordId,
                        doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Medical record not found"));

        verifyWorkerAccess(
                doctor,
                record.getWorker().getId());

        record.setVisitDate(
                request.getVisitDate());

        record.setSymptoms(
                request.getSymptoms());

        record.setDiagnosis(
                request.getDiagnosis());

        record.setTreatment(
                request.getTreatment());

        record.setNotes(
                request.getNotes());

        record = medicalRecordRepository.save(record);

        return toMedicalRecordResponse(record);
    }

    @Transactional
    public void deleteMedicalRecord(
            Long doctorUserId,
            Long recordId) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        MedicalRecord record = medicalRecordRepository
                .findByIdAndDoctor_Id(
                        recordId,
                        doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Medical record not found"));

        verifyWorkerAccess(
                doctor,
                record.getWorker().getId());

        /*
         * MedicalRecord has:
         *
         * cascade = CascadeType.ALL
         * orphanRemoval = true
         *
         * so its prescriptions will also be removed.
         */
        medicalRecordRepository.delete(record);
    }

    // =========================================================
    // PRESCRIPTIONS
    // =========================================================

    @Transactional
    public PrescriptionResponse createPrescription(
            Long doctorUserId,
            Long medicalRecordId,
            PrescriptionRequest request) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        MedicalRecord record = medicalRecordRepository
                .findByIdAndDoctor_Id(
                        medicalRecordId,
                        doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Medical record not found"));

        verifyWorkerAccess(
                doctor,
                record.getWorker().getId());

        Prescription prescription = Prescription.builder()
                .medicalRecord(record)
                .worker(record.getWorker())
                .doctor(doctor)
                .medicineName(
                        request.getMedicineName())
                .dosage(
                        request.getDosage())
                .frequency(
                        request.getFrequency())
                .duration(
                        request.getDuration())
                .instructions(
                        request.getInstructions())
                .build();

        prescription = prescriptionRepository.save(
                prescription);

        return toPrescriptionResponse(
                prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getMedicalRecordPrescriptions(
            Long doctorUserId,
            Long medicalRecordId) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        MedicalRecord record = medicalRecordRepository
                .findByIdAndDoctor_Id(
                        medicalRecordId,
                        doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Medical record not found"));

        verifyWorkerAccess(
                doctor,
                record.getWorker().getId());

        return prescriptionRepository
                .findByMedicalRecord_IdOrderByCreatedAtDesc(
                        medicalRecordId)
                .stream()
                .map(this::toPrescriptionResponse)
                .toList();
    }

    @Transactional
    public PrescriptionResponse updatePrescription(
            Long doctorUserId,
            Long prescriptionId,
            PrescriptionRequest request) {

        Doctor doctor = getDoctorByUserId(doctorUserId);

        Prescription prescription = prescriptionRepository
                .findByIdAndDoctor_Id(
                        prescriptionId,
                        doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Prescription not found"));

        verifyWorkerAccess(
                doctor,
                prescription
                        .getWorker()
                        .getId());

        prescription.setMedicineName(
                request.getMedicineName());

        prescription.setDosage(
                request.getDosage());

        prescription.setFrequency(
                request.getFrequency());

        prescription.setDuration(
                request.getDuration());

        prescription.setInstructions(
                request.getInstructions());

        prescription = prescriptionRepository.save(
                prescription);

        return toPrescriptionResponse(
                prescription);
    }

    @Transactional
    public void deletePrescription(
            Long doctorUserId,
            Long prescriptionId) {

        Doctor doctor = getDoctorByUserId(
                doctorUserId);

        Prescription prescription = prescriptionRepository
                .findByIdAndDoctor_Id(
                        prescriptionId,
                        doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Prescription not found"));

        verifyWorkerAccess(
                doctor,
                prescription
                        .getWorker()
                        .getId());

        prescriptionRepository.delete(
                prescription);
    }

    // =========================================================
    // AUTHORIZATION
    // =========================================================

    private void verifyWorkerAccess(
            Doctor doctor,
            Long workerId) {

        assignmentRepository
                .findByWorker_IdAndHospital_IdAndActiveTrue(
                        workerId,
                        doctor.getHospital().getId())
                .filter(assignment -> assignment.getDoctor()
                        .getId()
                        .equals(doctor.getId()))
                .orElseThrow(() -> new IllegalArgumentException(
                        "You are not authorized to access this worker"));
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private Doctor getDoctorByUserId(
            Long userId) {

        return doctorRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Doctor profile not found"));
    }

    private MedicalRecordResponse toMedicalRecordResponse(
            MedicalRecord record) {

        List<PrescriptionResponse> prescriptions = record.getPrescriptions()
                .stream()
                .map(this::toPrescriptionResponse)
                .toList();

        return MedicalRecordResponse.builder()
                .id(record.getId())
                .workerId(
                        record.getWorker().getId())
                .doctorId(
                        record.getDoctor().getId())
                .hospitalId(
                        record.getHospital().getId())
                .visitDate(
                        record.getVisitDate())
                .symptoms(
                        record.getSymptoms())
                .diagnosis(
                        record.getDiagnosis())
                .treatment(
                        record.getTreatment())
                .notes(
                        record.getNotes())
                .createdAt(
                        record.getCreatedAt())
                .prescriptions(
                        prescriptions)
                .build();
    }

    private PrescriptionResponse toPrescriptionResponse(
            Prescription prescription) {

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .medicalRecordId(
                        prescription
                                .getMedicalRecord()
                                .getId())
                .workerId(
                        prescription
                                .getWorker()
                                .getId())
                .doctorId(
                        prescription
                                .getDoctor()
                                .getId())
                .medicineName(
                        prescription
                                .getMedicineName())
                .dosage(
                        prescription.getDosage())
                .frequency(
                        prescription.getFrequency())
                .duration(
                        prescription.getDuration())
                .instructions(
                        prescription.getInstructions())
                .filePath(
                        prescription.getFilePath())
                .createdAt(
                        prescription.getCreatedAt())
                .build();
    }
}