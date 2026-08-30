package com.dhrms.dhrms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dhrms.dhrms_backend.entity.MedicalRecord;

public interface MedicalRecordRepository
                extends JpaRepository<MedicalRecord, Long> {

        List<MedicalRecord> findByWorker_IdOrderByVisitDateDesc(
                        Long workerId);

        List<MedicalRecord> findByDoctor_IdOrderByVisitDateDesc(
                        Long doctorId);

        List<MedicalRecord> findByHospital_IdOrderByVisitDateDesc(
                        Long hospitalId);

        List<MedicalRecord> findByWorker_IdAndHospital_IdOrderByVisitDateDesc(
                        Long workerId,
                        Long hospitalId);

        Optional<MedicalRecord> findByIdAndWorker_Id(
                        Long id,
                        Long workerId);

        List<MedicalRecord> findByWorker_IdAndDoctor_IdOrderByVisitDateDesc(
                        Long workerId,
                        Long doctorId);

        Optional<MedicalRecord> findByIdAndDoctor_Id(
                        Long recordId,
                        Long doctorId);

        List<MedicalRecord> findByWorkerIdOrderByVisitDateDesc(Long workerId);
}