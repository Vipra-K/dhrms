package com.dhrms.dhrms_backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhrms.dhrms_backend.dto.doctor.CreateDoctorRequest;
import com.dhrms.dhrms_backend.dto.doctor.DoctorResponse;
import com.dhrms.dhrms_backend.dto.doctor.UpdateDoctorRequest;
import com.dhrms.dhrms_backend.entity.Doctor;
import com.dhrms.dhrms_backend.entity.Hospital;
import com.dhrms.dhrms_backend.entity.User;
import com.dhrms.dhrms_backend.entity.enums.DoctorRole;
import com.dhrms.dhrms_backend.entity.enums.DoctorStatus;
import com.dhrms.dhrms_backend.entity.enums.UserRole;
import com.dhrms.dhrms_backend.entity.enums.UserStatus;
import com.dhrms.dhrms_backend.repository.DoctorRepository;
import com.dhrms.dhrms_backend.repository.HospitalRepository;
import com.dhrms.dhrms_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {

        private final DoctorRepository doctorRepository;

        private final HospitalRepository hospitalRepository;

        private final UserRepository userRepository;

        private final PasswordEncoder passwordEncoder;

        @Transactional(readOnly = true)
        public DoctorResponse getMyProfile(Long userId) {

                Doctor doctor = doctorRepository
                                .findByUser_Id(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Doctor profile not found"));

                return toResponse(doctor);
        }

        @Transactional
        public DoctorResponse createDoctor(
                        Long hospitalUserId,
                        CreateDoctorRequest request) {

                Hospital hospital = getHospitalByUserId(hospitalUserId);

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new IllegalArgumentException(
                                        "Email is already registered");
                }

                if (request.getLicenseNumber() != null
                                && !request.getLicenseNumber().isBlank()
                                && doctorRepository.existsByLicenseNumber(
                                                request.getLicenseNumber())) {
                        throw new IllegalArgumentException(
                                        "License number is already registered");
                }

                User user = User.builder()
                                .email(request.getEmail())
                                .passwordHash(
                                                passwordEncoder.encode(
                                                                request.getPassword()))
                                .role(UserRole.DOCTOR)
                                .status(UserStatus.ACTIVE)
                                .build();

                userRepository.save(user);

                Doctor doctor = Doctor.builder()
                                .user(user)
                                .hospital(hospital)
                                .fullName(request.getFullName())
                                .specialization(request.getSpecialization())
                                .licenseNumber(request.getLicenseNumber())
                                .department(request.getDepartment())
                                .role(
                                                request.getRole() != null
                                                                ? request.getRole()
                                                                : DoctorRole.JUNIOR_DOCTOR)
                                .status(DoctorStatus.ACTIVE)
                                .build();

                doctorRepository.save(doctor);

                return toResponse(doctor);
        }

        @Transactional(readOnly = true)
        public List<DoctorResponse> getHospitalDoctors(
                        Long hospitalUserId) {

                Hospital hospital = getHospitalByUserId(hospitalUserId);

                return doctorRepository
                                .findByHospital_Id(hospital.getId())
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<DoctorResponse> getDoctorsForHospital(
                        Long hospitalUserId) {

                Hospital hospital = hospitalRepository
                                .findByUser_Id(hospitalUserId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Hospital profile not found"));

                return doctorRepository
                                .findByHospital_IdAndStatus(
                                                hospital.getId(),
                                                DoctorStatus.ACTIVE)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public DoctorResponse getDoctor(
                        Long hospitalUserId,
                        Long doctorId) {

                Hospital hospital = getHospitalByUserId(hospitalUserId);

                Doctor doctor = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Doctor not found"));

                verifyDoctorBelongsToHospital(
                                doctor,
                                hospital);

                return toResponse(doctor);
        }

        @Transactional
        public DoctorResponse updateDoctor(
                        Long hospitalUserId,
                        Long doctorId,
                        UpdateDoctorRequest request) {

                Hospital hospital = getHospitalByUserId(hospitalUserId);

                Doctor doctor = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Doctor not found"));

                verifyDoctorBelongsToHospital(
                                doctor,
                                hospital);

                if (request.getLicenseNumber() != null
                                && !request.getLicenseNumber().isBlank()
                                && doctorRepository
                                                .existsByLicenseNumberAndIdNot(
                                                                request.getLicenseNumber(),
                                                                doctorId)) {
                        throw new IllegalArgumentException(
                                        "License number is already registered");
                }

                if (request.getFullName() != null) {
                        doctor.setFullName(
                                        request.getFullName());
                }

                if (request.getSpecialization() != null) {
                        doctor.setSpecialization(
                                        request.getSpecialization());
                }

                if (request.getLicenseNumber() != null) {
                        doctor.setLicenseNumber(
                                        request.getLicenseNumber());
                }

                if (request.getDepartment() != null) {
                        doctor.setDepartment(
                                        request.getDepartment());
                }

                if (request.getRole() != null) {
                        doctor.setRole(
                                        request.getRole());
                }

                return toResponse(
                                doctorRepository.save(doctor));
        }

        @Transactional
        public DoctorResponse activateDoctor(
                        Long hospitalUserId,
                        Long doctorId) {

                return changeDoctorStatus(
                                hospitalUserId,
                                doctorId,
                                DoctorStatus.ACTIVE);
        }

        @Transactional
        public DoctorResponse suspendDoctor(
                        Long hospitalUserId,
                        Long doctorId) {

                return changeDoctorStatus(
                                hospitalUserId,
                                doctorId,
                                DoctorStatus.SUSPENDED);
        }

        @Transactional
        public DoctorResponse deactivateDoctor(
                        Long hospitalUserId,
                        Long doctorId) {

                Hospital hospital = getHospitalByUserId(hospitalUserId);

                Doctor doctor = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Doctor not found"));

                verifyDoctorBelongsToHospital(
                                doctor,
                                hospital);

                doctor.setStatus(
                                DoctorStatus.INACTIVE);

                doctor.getUser()
                                .setStatus(UserStatus.INACTIVE);

                return toResponse(
                                doctorRepository.save(doctor));
        }

        private DoctorResponse changeDoctorStatus(
                        Long hospitalUserId,
                        Long doctorId,
                        DoctorStatus status) {

                Hospital hospital = getHospitalByUserId(hospitalUserId);

                Doctor doctor = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Doctor not found"));

                verifyDoctorBelongsToHospital(
                                doctor,
                                hospital);

                doctor.setStatus(status);

                if (status == DoctorStatus.ACTIVE) {
                        doctor.getUser()
                                        .setStatus(UserStatus.ACTIVE);
                } else {
                        doctor.getUser()
                                        .setStatus(UserStatus.INACTIVE);
                }

                return toResponse(
                                doctorRepository.save(doctor));
        }

        private Hospital getHospitalByUserId(
                        Long userId) {

                return hospitalRepository
                                .findByUser_Id(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Hospital profile not found"));
        }

        private void verifyDoctorBelongsToHospital(
                        Doctor doctor,
                        Hospital hospital) {

                if (!doctor.getHospital()
                                .getId()
                                .equals(hospital.getId())) {
                        throw new IllegalArgumentException(
                                        "Doctor does not belong to this hospital");
                }
        }

        private DoctorResponse toResponse(
                        Doctor doctor) {

                return DoctorResponse.builder()
                                .id(doctor.getId())
                                .fullName(doctor.getFullName())
                                .email(doctor.getUser().getEmail())
                                .specialization(
                                                doctor.getSpecialization())
                                .licenseNumber(
                                                doctor.getLicenseNumber())
                                .department(
                                                doctor.getDepartment())
                                .role(doctor.getRole())
                                .status(doctor.getStatus())
                                .hospitalId(
                                                doctor.getHospital().getId())
                                .build();
        }
}