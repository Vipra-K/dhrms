package com.dhrms.dhrms_backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhrms.dhrms_backend.dto.worker.CreateWorkerRequest;
import com.dhrms.dhrms_backend.dto.worker.UpdateWorkerRequest;
import com.dhrms.dhrms_backend.dto.worker.WorkerMedicalRecordResponse;
import com.dhrms.dhrms_backend.dto.worker.WorkerProfileResponse;
import com.dhrms.dhrms_backend.dto.worker.WorkerResponse;
import com.dhrms.dhrms_backend.entity.Doctor;
import com.dhrms.dhrms_backend.entity.Hospital;
import com.dhrms.dhrms_backend.entity.User;
import com.dhrms.dhrms_backend.entity.Worker;
import com.dhrms.dhrms_backend.entity.enums.UserRole;
import com.dhrms.dhrms_backend.entity.enums.UserStatus;
import com.dhrms.dhrms_backend.repository.DoctorWorkerAssignmentRepository;
import com.dhrms.dhrms_backend.repository.HospitalRepository;
import com.dhrms.dhrms_backend.repository.MedicalRecordRepository;
import com.dhrms.dhrms_backend.repository.UserRepository;
import com.dhrms.dhrms_backend.repository.WorkerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkerService {

        private final UserRepository userRepository;

        private final PasswordEncoder passwordEncoder;

        private final WorkerRepository workerRepository;

        private final HospitalRepository hospitalRepository;

        private final DoctorWorkerAssignmentRepository assignmentRepository;
        private final MedicalRecordRepository medicalRecordRepository;

        @Transactional
        public WorkerResponse createWorker(
                        Long hospitalUserId,
                        CreateWorkerRequest request) {

                /*
                 * Verify that the authenticated user
                 * actually belongs to a hospital.
                 */
                getHospitalByUserId(hospitalUserId);

                /*
                 * Email must be unique because it is used
                 * for authentication.
                 */
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new IllegalArgumentException(
                                        "Email is already registered");
                }

                /*
                 * Create authentication account.
                 */
                User user = User.builder()
                                .email(request.getEmail())
                                .passwordHash(
                                                passwordEncoder.encode(
                                                                request.getPassword()))
                                .role(UserRole.WORKER)
                                .status(UserStatus.ACTIVE)
                                .build();

                user = userRepository.save(user);

                /*
                 * Create worker profile.
                 */
                Worker worker = Worker.builder()
                                .user(user)
                                .workerCode(generateWorkerCode())
                                .fullName(request.getFullName())
                                .dateOfBirth(request.getDateOfBirth())
                                .gender(request.getGender())
                                .bloodGroup(request.getBloodGroup())
                                .phone(request.getPhone())
                                .address(request.getAddress())
                                .emergencyContactName(
                                                request.getEmergencyContactName())
                                .emergencyContactPhone(
                                                request.getEmergencyContactPhone())
                                .emergencyContactRelation(
                                                request.getEmergencyContactRelation())
                                .active(true)
                                .build();

                worker = workerRepository.save(worker);

                return toResponse(worker);
        }

        @Transactional(readOnly = true)
        public List<WorkerResponse> getWorkers(
                        Long hospitalUserId) {

                getHospitalByUserId(hospitalUserId);

                return workerRepository
                                .findByActiveTrue()
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public WorkerResponse getWorker(
                        Long hospitalUserId,
                        Long workerId) {

                Hospital hospital = getHospitalByUserId(hospitalUserId);

                Worker worker = workerRepository
                                .findById(workerId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Worker not found"));

                WorkerResponse.WorkerResponseBuilder response = WorkerResponse.builder()
                                .id(worker.getId())
                                .workerCode(worker.getWorkerCode())
                                .fullName(worker.getFullName())
                                .dateOfBirth(worker.getDateOfBirth())
                                .gender(worker.getGender())
                                .bloodGroup(worker.getBloodGroup())
                                .phone(worker.getPhone())
                                .address(worker.getAddress())
                                .emergencyContactName(
                                                worker.getEmergencyContactName())
                                .emergencyContactPhone(
                                                worker.getEmergencyContactPhone())
                                .emergencyContactRelation(
                                                worker.getEmergencyContactRelation())
                                .active(worker.getActive())
                                .createdAt(worker.getCreatedAt());

                assignmentRepository
                                .findByWorker_IdAndHospital_IdAndActiveTrue(
                                                workerId,
                                                hospital.getId())
                                .ifPresent(assignment -> {

                                        Doctor doctor = assignment.getDoctor();

                                        response.assignedDoctorId(
                                                        doctor.getId());

                                        response.assignedDoctorName(
                                                        doctor.getFullName());

                                        response.assignedDoctorSpecialization(
                                                        doctor.getSpecialization());
                                });

                return response.build();
        }

        @Transactional(readOnly = true)
        public WorkerResponse getWorkerByCode(
                        Long hospitalUserId,
                        String workerCode) {

                getHospitalByUserId(hospitalUserId);

                Worker worker = workerRepository
                                .findByWorkerCode(workerCode)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Worker not found"));

                return toResponse(worker);
        }

        @Transactional(readOnly = true)
        public WorkerResponse getWorkerForDoctor(
                        Long workerId) {

                Worker worker = workerRepository
                                .findById(workerId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Worker not found"));

                return toResponse(worker);
        }

        @Transactional
        public WorkerResponse updateWorker(
                        Long hospitalUserId,
                        Long workerId,
                        UpdateWorkerRequest request) {

                getHospitalByUserId(hospitalUserId);

                Worker worker = workerRepository
                                .findById(workerId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Worker not found"));

                if (request.getFullName() != null) {
                        worker.setFullName(
                                        request.getFullName());
                }

                if (request.getDateOfBirth() != null) {
                        worker.setDateOfBirth(
                                        request.getDateOfBirth());
                }

                if (request.getGender() != null) {
                        worker.setGender(
                                        request.getGender());
                }

                if (request.getBloodGroup() != null) {
                        worker.setBloodGroup(
                                        request.getBloodGroup());
                }

                if (request.getPhone() != null) {
                        worker.setPhone(
                                        request.getPhone());
                }

                if (request.getAddress() != null) {
                        worker.setAddress(
                                        request.getAddress());
                }

                if (request.getEmergencyContactName() != null) {
                        worker.setEmergencyContactName(
                                        request.getEmergencyContactName());
                }

                if (request.getEmergencyContactPhone() != null) {
                        worker.setEmergencyContactPhone(
                                        request.getEmergencyContactPhone());
                }

                if (request.getEmergencyContactRelation() != null) {
                        worker.setEmergencyContactRelation(
                                        request.getEmergencyContactRelation());
                }

                return toResponse(
                                workerRepository.save(worker));
        }

        @Transactional
        public WorkerResponse deactivateWorker(
                        Long hospitalUserId,
                        Long workerId) {

                getHospitalByUserId(hospitalUserId);

                Worker worker = workerRepository
                                .findById(workerId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Worker not found"));

                worker.setActive(false);

                return toResponse(
                                workerRepository.save(worker));
        }

        @Transactional
        public WorkerResponse activateWorker(
                        Long hospitalUserId,
                        Long workerId) {

                getHospitalByUserId(hospitalUserId);

                Worker worker = workerRepository
                                .findById(workerId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Worker not found"));

                worker.setActive(true);

                return toResponse(
                                workerRepository.save(worker));
        }

        private Hospital getHospitalByUserId(
                        Long userId) {

                return hospitalRepository
                                .findByUser_Id(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Hospital profile not found"));
        }

        private String generateWorkerCode() {

                String code;

                do {
                        code = "DHRMS-WKR-" +
                                        String.format(
                                                        "%08d",
                                                        (long) (Math.random() * 100000000));

                } while (workerRepository.existsByWorkerCode(code));

                return code;
        }

        private WorkerResponse toResponse(
                        Worker worker) {

                return WorkerResponse.builder()
                                .id(worker.getId())
                                .workerCode(worker.getWorkerCode())
                                .fullName(worker.getFullName())
                                .dateOfBirth(worker.getDateOfBirth())
                                .gender(worker.getGender())
                                .bloodGroup(worker.getBloodGroup())
                                .phone(worker.getPhone())
                                .address(worker.getAddress())
                                .emergencyContactName(
                                                worker.getEmergencyContactName())
                                .emergencyContactPhone(
                                                worker.getEmergencyContactPhone())
                                .emergencyContactRelation(
                                                worker.getEmergencyContactRelation())
                                .active(worker.getActive())
                                .createdAt(worker.getCreatedAt())
                                .build();
        }

        public WorkerProfileResponse getMyProfile(Long userId) {

                Worker worker = workerRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

                return WorkerProfileResponse.builder()
                                .id(worker.getId())
                                .workerCode(worker.getWorkerCode())
                                .fullName(worker.getFullName())
                                .dateOfBirth(worker.getDateOfBirth())
                                .gender(worker.getGender())
                                .bloodGroup(worker.getBloodGroup())
                                .phone(worker.getPhone())
                                .address(worker.getAddress())
                                .emergencyContactName(worker.getEmergencyContactName())
                                .emergencyContactPhone(worker.getEmergencyContactPhone())
                                .emergencyContactRelation(worker.getEmergencyContactRelation())
                                .build();
        }

        public List<WorkerMedicalRecordResponse> getMyMedicalRecords(Long userId) {

                Worker worker = workerRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

                return medicalRecordRepository
                                .findByWorkerIdOrderByVisitDateDesc(worker.getId())
                                .stream()
                                .map(record -> WorkerMedicalRecordResponse.builder()
                                                .id(record.getId())
                                                .visitDate(record.getVisitDate())
                                                .hospitalName(
                                                                record.getHospital().getName())
                                                .doctorName(
                                                                record.getDoctor().getFullName())
                                                .symptoms(record.getSymptoms())
                                                .diagnosis(record.getDiagnosis())
                                                .treatment(record.getTreatment())
                                                .notes(record.getNotes())
                                                .build())
                                .toList();
        }
}