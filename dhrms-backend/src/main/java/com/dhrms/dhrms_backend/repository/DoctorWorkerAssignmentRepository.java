package com.dhrms.dhrms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dhrms.dhrms_backend.entity.DoctorWorkerAssignment;

public interface DoctorWorkerAssignmentRepository
                extends JpaRepository<DoctorWorkerAssignment, Long> {

        // --- Existing Methods ---

        Optional<DoctorWorkerAssignment> findByWorker_IdAndHospital_IdAndActiveTrue(
                        Long workerId,
                        Long hospitalId);

        Optional<DoctorWorkerAssignment> findByDoctor_IdAndWorker_IdAndHospital_Id(
                        Long doctorId,
                        Long workerId,
                        Long hospitalId);

        List<DoctorWorkerAssignment> findByDoctor_IdAndHospital_IdAndActiveTrue(
                        Long doctorId,
                        Long hospitalId);

        List<DoctorWorkerAssignment> findByWorker_IdAndHospital_IdOrderByAssignedAtDesc(
                        Long workerId,
                        Long hospitalId);

        // --- New Methods ---

        List<DoctorWorkerAssignment> findByDoctor_IdAndActiveTrue(
                        Long doctorId);

        List<DoctorWorkerAssignment> findByWorker_IdAndActiveTrue(
                        Long workerId);

        List<DoctorWorkerAssignment> findByHospital_IdAndActiveTrue(
                        Long hospitalId);

        boolean existsByDoctor_IdAndWorker_IdAndHospital_IdAndActiveTrue(
                        Long doctorId,
                        Long workerId,
                        Long hospitalId);

        boolean existsByWorker_IdAndHospital_IdAndActiveTrue(
                        Long workerId,
                        Long hospitalId);
}
