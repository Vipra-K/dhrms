package com.dhrms.dhrms_backend.controller;

import com.dhrms.dhrms_backend.dto.doctor.DoctorResponse;
import com.dhrms.dhrms_backend.security.AuthenticatedUserService;
import com.dhrms.dhrms_backend.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorDashboardController {

    private final DoctorService doctorService;

    private final AuthenticatedUserService authenticatedUserService;

    @GetMapping("/me")
    public ResponseEntity<DoctorResponse> getMyProfile(
            Authentication authentication
    ) {

        Long userId = authenticatedUserService
                .getUser(authentication)
                .getId();

        return ResponseEntity.ok(
                doctorService.getMyProfile(userId)
        );
    }
}