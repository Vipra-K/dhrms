package com.dhrms.dhrms_backend.repository;

import com.dhrms.dhrms_backend.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByHospitalCode(String hospitalCode);

    boolean existsByHospitalCode(String hospitalCode);

    Optional<Hospital> findByHfrFacility_HfrId(String hfrId);

    Optional<Hospital> findByUser_Id(Long userId);
}