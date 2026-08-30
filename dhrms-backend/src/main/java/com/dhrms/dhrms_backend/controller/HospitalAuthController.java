package com.dhrms.dhrms_backend.controller;

import com.dhrms.dhrms_backend.dto.hospital.RegisterHospitalRequest;
import com.dhrms.dhrms_backend.entity.Hospital;
import com.dhrms.dhrms_backend.service.HospitalAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalAuthController {

    private final HospitalAuthService hospitalAuthService;

    @PostMapping("/register")
    public ResponseEntity<?> registerHospital(
            @Valid @RequestBody RegisterHospitalRequest request) {

        Hospital hospital = hospitalAuthService.registerHospital(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        Map.of(
                                "message",
                                "Hospital registered successfully",
                                "hospitalId",
                                hospital.getId(),
                                "hospitalCode",
                                hospital.getHospitalCode(),
                                "name",
                                hospital.getName()));
    }
}