package com.dhrms.dhrms_backend.config;

import com.dhrms.dhrms_backend.entity.HfrFacility;
import com.dhrms.dhrms_backend.entity.enums.HfrFacilityStatus;
import com.dhrms.dhrms_backend.repository.HfrFacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final HfrFacilityRepository hfrFacilityRepository;

    @Bean
    CommandLineRunner initializeHfrFacilities() {

        return args -> {

            createIfNotExists(
                    "HFR-KL-0001",
                    "Government General Hospital",
                    "Government Hospital",
                    "Ernakulam");

            createIfNotExists(
                    "HFR-KL-0002",
                    "District Hospital",
                    "District Hospital",
                    "Kozhikode");

            createIfNotExists(
                    "HFR-KL-0003",
                    "City Medical Centre",
                    "Private Hospital",
                    "Kochi");
        };
    }

    private void createIfNotExists(
            String hfrId,
            String name,
            String type,
            String district) {

        if (hfrFacilityRepository.existsByHfrId(hfrId)) {
            return;
        }

        HfrFacility facility = HfrFacility.builder()
                .hfrId(hfrId)
                .facilityName(name)
                .facilityType(type)
                .district(district)
                .status(HfrFacilityStatus.ACTIVE)
                .build();

        hfrFacilityRepository.save(facility);
    }
}