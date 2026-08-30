package com.dhrms.dhrms_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dhrms.dhrms_backend.dto.doctor.CreateDoctorRequest;
import com.dhrms.dhrms_backend.dto.doctor.DoctorResponse;
import com.dhrms.dhrms_backend.dto.doctor.UpdateDoctorRequest;
import com.dhrms.dhrms_backend.security.AuthenticatedUserService;
import com.dhrms.dhrms_backend.service.DoctorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hospitals/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOSPITAL')")
public class DoctorController {

        private final AuthenticatedUserService authenticatedUserService;
        private final DoctorService doctorService;

        @PostMapping
        public ResponseEntity<DoctorResponse> createDoctor(
                        Authentication authentication,
                        @Valid @RequestBody CreateDoctorRequest request) {

                Long hospitalUserId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(
                                                doctorService.createDoctor(
                                                                hospitalUserId,
                                                                request));
        }

        @GetMapping
        public ResponseEntity<List<DoctorResponse>> getDoctors(
                        Authentication authentication) {

                Long hospitalUserId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                doctorService.getHospitalDoctors(
                                                hospitalUserId));
        }

        @GetMapping("/hospital/doctors")
        @PreAuthorize("hasRole('HOSPITAL')")
        public ResponseEntity<List<DoctorResponse>> getHospitalDoctors(
                        Authentication authentication) {

                Long userId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                doctorService.getDoctorsForHospital(
                                                userId));
        }

        @GetMapping("/{doctorId}")
        public ResponseEntity<DoctorResponse> getDoctor(
                        Authentication authentication,
                        @PathVariable Long doctorId) {

                Long hospitalUserId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                doctorService.getDoctor(
                                                hospitalUserId,
                                                doctorId));
        }

        @PutMapping("/{doctorId}")
        public ResponseEntity<DoctorResponse> updateDoctor(
                        Authentication authentication,
                        @PathVariable Long doctorId,
                        @Valid @RequestBody UpdateDoctorRequest request) {

                Long hospitalUserId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                doctorService.updateDoctor(
                                                hospitalUserId,
                                                doctorId,
                                                request));
        }

        @PatchMapping("/{doctorId}/activate")
        public ResponseEntity<DoctorResponse> activateDoctor(
                        Authentication authentication,
                        @PathVariable Long doctorId) {

                Long hospitalUserId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                doctorService.activateDoctor(
                                                hospitalUserId,
                                                doctorId));
        }

        @PatchMapping("/{doctorId}/suspend")
        public ResponseEntity<DoctorResponse> suspendDoctor(
                        Authentication authentication,
                        @PathVariable Long doctorId) {

                Long hospitalUserId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                doctorService.suspendDoctor(
                                                hospitalUserId,
                                                doctorId));
        }

        @PatchMapping("/{doctorId}/deactivate")
        public ResponseEntity<DoctorResponse> deactivateDoctor(
                        Authentication authentication,
                        @PathVariable Long doctorId) {

                Long hospitalUserId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                doctorService.deactivateDoctor(
                                                hospitalUserId,
                                                doctorId));
        }

}