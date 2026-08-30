package com.dhrms.dhrms_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhrms.dhrms_backend.dto.assignment.AssignWorkerRequest;
import com.dhrms.dhrms_backend.dto.assignment.AssignmentResponse;
import com.dhrms.dhrms_backend.dto.assignment.DoctorWorkerResponse;
import com.dhrms.dhrms_backend.entity.Doctor;
import com.dhrms.dhrms_backend.entity.DoctorWorkerAssignment;
import com.dhrms.dhrms_backend.entity.Hospital;
import com.dhrms.dhrms_backend.entity.Worker;
import com.dhrms.dhrms_backend.entity.enums.DoctorStatus;
import com.dhrms.dhrms_backend.repository.DoctorRepository;
import com.dhrms.dhrms_backend.repository.DoctorWorkerAssignmentRepository;
import com.dhrms.dhrms_backend.repository.HospitalRepository;
import com.dhrms.dhrms_backend.repository.WorkerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorWorkerAssignmentService {

    private final DoctorWorkerAssignmentRepository assignmentRepository;

    private final DoctorRepository doctorRepository;

    private final WorkerRepository workerRepository;

    private final HospitalRepository hospitalRepository;

    /*
     * Hospital assigns/reassigns worker to doctor.
     */
    @Transactional
    public AssignmentResponse assignWorker(
            Long hospitalUserId,
            Long workerId,
            AssignWorkerRequest request) {

        Hospital hospital = getHospitalByUserId(
                hospitalUserId);

        Worker worker = workerRepository
                .findById(workerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Worker not found"));

        Doctor doctor = doctorRepository
                .findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Doctor not found"));

        /*
         * Very important:
         *
         * A hospital must only assign workers to
         * doctors belonging to that hospital.
         */
        if (!doctor.getHospital().getId()
                .equals(hospital.getId())) {

            throw new IllegalArgumentException(
                    "Doctor does not belong to this hospital");
        }

        if (doctor.getStatus() != DoctorStatus.ACTIVE) {

            throw new IllegalArgumentException(
                    "Doctor is not active");
        }

        /*
         * Check current active assignment.
         */
        var currentAssignment = assignmentRepository
                .findByWorker_IdAndHospital_IdAndActiveTrue(
                        workerId,
                        hospital.getId());

        if (currentAssignment.isPresent()) {

            DoctorWorkerAssignment current = currentAssignment.get();

            /*
             * Worker is already assigned to
             * the requested doctor.
             */
            if (current.getDoctor().getId()
                    .equals(doctor.getId())) {

                return toAssignmentResponse(
                        current);
            }

            /*
             * Reassignment.
             */
            current.setActive(false);

            assignmentRepository.save(current);
        }

        /*
         * Check whether this worker/doctor/hospital
         * assignment existed previously.
         *
         * This matters because of the unique constraint:
         *
         * doctor_id + worker_id + hospital_id
         */
        var existingAssignment = assignmentRepository
                .findByDoctor_IdAndWorker_IdAndHospital_Id(
                        doctor.getId(),
                        worker.getId(),
                        hospital.getId());

        DoctorWorkerAssignment assignment;

        if (existingAssignment.isPresent()) {

            assignment = existingAssignment.get();

            assignment.setActive(true);

        } else {

            assignment = DoctorWorkerAssignment.builder()
                    .doctor(doctor)
                    .worker(worker)
                    .hospital(hospital)
                    .assignedBy(hospitalUserId)
                    .active(true)
                    .build();
        }

        assignment = assignmentRepository.save(
                assignment);

        return toAssignmentResponse(
                assignment);
    }

    /*
     * Get all active doctors belonging to
     * the hospital.
     */
    @Transactional(readOnly = true)
    public List<DoctorWorkerResponse> getMyWorkers(
            Long doctorUserId) {

        Doctor doctor = doctorRepository
                .findByUser_Id(doctorUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Doctor profile not found"));

        List<DoctorWorkerAssignment> assignments = assignmentRepository
                .findByDoctor_IdAndHospital_IdAndActiveTrue(
                        doctor.getId(),
                        doctor.getHospital().getId());

        return assignments.stream()
                .map(assignment -> toDoctorWorkerResponse(
                        assignment.getWorker()))
                .toList();
    }

    /*
     * Get the current active assignment of a worker
     * for a particular hospital.
     */
    @Transactional(readOnly = true)
    public AssignmentResponse getWorkerAssignment(
            Long hospitalUserId,
            Long workerId) {

        Hospital hospital = getHospitalByUserId(
                hospitalUserId);

        DoctorWorkerAssignment assignment = assignmentRepository
                .findByWorker_IdAndHospital_IdAndActiveTrue(
                        workerId,
                        hospital.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Worker is not assigned to a doctor"));

        return toAssignmentResponse(
                assignment);
    }

    /*
     * Doctor can access a worker only when
     * an active assignment exists.
     */
    @Transactional(readOnly = true)
    public void verifyDoctorWorkerAccess(
            Long doctorUserId,
            Long workerId) {

        Doctor doctor = doctorRepository
                .findByUser_Id(doctorUserId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Doctor profile not found"));

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

    private Hospital getHospitalByUserId(
            Long userId) {

        return hospitalRepository
                .findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Hospital profile not found"));
    }

    private AssignmentResponse toAssignmentResponse(
            DoctorWorkerAssignment assignment) {

        Doctor doctor = assignment.getDoctor();

        Worker worker = assignment.getWorker();

        return AssignmentResponse.builder()
                .id(assignment.getId())
                .workerId(worker.getId())
                .workerCode(worker.getWorkerCode())
                .doctorId(doctor.getId())
                .doctorName(doctor.getFullName())
                .doctorSpecialization(
                        doctor.getSpecialization())
                .hospitalId(
                        assignment.getHospital().getId())
                .active(assignment.getActive())
                .assignedAt(
                        assignment.getAssignedAt())
                .build();
    }

    private DoctorWorkerResponse toDoctorWorkerResponse(
            Worker worker) {

        return DoctorWorkerResponse.builder()
                .workerId(worker.getId())
                .workerCode(worker.getWorkerCode())
                .fullName(worker.getFullName())
                .dateOfBirth(worker.getDateOfBirth())
                .gender(worker.getGender())
                .bloodGroup(worker.getBloodGroup())
                .phone(worker.getPhone())
                .build();
    }
}