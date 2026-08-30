package com.dhrms.dhrms_backend.repository;

import com.dhrms.dhrms_backend.entity.Doctor;
import com.dhrms.dhrms_backend.entity.enums.DoctorStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUser_Id(Long userId);

    List<Doctor> findByHospital_Id(Long hospitalId);

    List<Doctor> findByHospital_IdAndStatus(
            Long hospitalId,
            DoctorStatus status);

    boolean existsByLicenseNumber(String licenseNumber);

    boolean existsByLicenseNumberAndIdNot(
            String licenseNumber,
            Long id);
}