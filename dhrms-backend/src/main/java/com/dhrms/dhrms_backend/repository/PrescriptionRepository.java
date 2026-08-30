package com.dhrms.dhrms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dhrms.dhrms_backend.entity.Prescription;

public interface PrescriptionRepository
                extends JpaRepository<Prescription, Long> {

        List<Prescription> findByWorker_IdOrderByCreatedAtDesc(
                        Long workerId);

        List<Prescription> findByDoctor_IdOrderByCreatedAtDesc(
                        Long doctorId);

        List<Prescription> findByMedicalRecord_IdOrderByCreatedAtDesc(
                        Long medicalRecordId);

        List<Prescription> findByMedicalRecord_Id(
                        Long medicalRecordId);

        Optional<Prescription> findByIdAndDoctor_Id(Long prescriptionId,
                        Long doctorId);
}