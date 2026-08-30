package com.dhrms.dhrms_backend.service;

import com.dhrms.dhrms_backend.dto.hospital.RegisterHospitalRequest;
import com.dhrms.dhrms_backend.entity.HfrFacility;
import com.dhrms.dhrms_backend.entity.Hospital;
import com.dhrms.dhrms_backend.entity.User;
import com.dhrms.dhrms_backend.entity.enums.HospitalStatus;
import com.dhrms.dhrms_backend.entity.enums.UserRole;
import com.dhrms.dhrms_backend.entity.enums.UserStatus;
import com.dhrms.dhrms_backend.repository.HfrFacilityRepository;
import com.dhrms.dhrms_backend.repository.HospitalRepository;
import com.dhrms.dhrms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HospitalAuthService {

    private final UserRepository userRepository;

    private final HospitalRepository hospitalRepository;

    private final HfrFacilityRepository hfrFacilityRepository;

    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Hospital registerHospital(
            RegisterHospitalRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is already registered");
        }

        if (hospitalRepository
                .existsByHospitalCode(
                        request.getHospitalCode())) {
            throw new IllegalArgumentException(
                    "Hospital code is already registered");
        }

        HfrFacility hfrFacility = hfrFacilityRepository
                .findByHfrId(request.getHfrId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid HFR ID"));

        if (hfrFacility.getStatus() != com.dhrms.dhrms_backend.entity.enums.HfrFacilityStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "HFR facility is inactive");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(
                        passwordEncoder.encode(
                                request.getPassword()))
                .role(UserRole.HOSPITAL)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        Hospital hospital = Hospital.builder()
                .user(user)
                .hfrFacility(hfrFacility)
                .hospitalCode(request.getHospitalCode())
                .name(request.getHospitalName())
                .address(request.getAddress())
                .city(request.getCity())
                .district(request.getDistrict())
                .phone(request.getPhone())
                .status(HospitalStatus.ACTIVE)
                .build();

        return hospitalRepository.save(hospital);
    }
}