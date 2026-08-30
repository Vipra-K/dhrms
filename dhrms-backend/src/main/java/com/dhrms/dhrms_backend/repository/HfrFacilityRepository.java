package com.dhrms.dhrms_backend.repository;

import com.dhrms.dhrms_backend.entity.HfrFacility;
import com.dhrms.dhrms_backend.entity.enums.HfrFacilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HfrFacilityRepository
        extends JpaRepository<HfrFacility, Long> {

    Optional<HfrFacility> findByHfrId(String hfrId);

    boolean existsByHfrId(String hfrId);

    Optional<HfrFacility> findByHfrIdAndStatus(
            String hfrId,
            HfrFacilityStatus status);

    List<HfrFacility> findByStatus(HfrFacilityStatus status);
}