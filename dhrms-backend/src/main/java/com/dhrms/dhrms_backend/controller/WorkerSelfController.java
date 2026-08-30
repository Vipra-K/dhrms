package com.dhrms.dhrms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dhrms.dhrms_backend.dto.worker.WorkerMedicalRecordResponse;
import com.dhrms.dhrms_backend.dto.worker.WorkerProfileResponse;
import com.dhrms.dhrms_backend.security.AuthenticatedUserService;
import com.dhrms.dhrms_backend.service.WorkerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workers/me")
@RequiredArgsConstructor
@PreAuthorize("hasRole('WORKER')")
public class WorkerSelfController {

        private final WorkerService workerService;

        private final AuthenticatedUserService authenticatedUserService;

        @GetMapping
        public ResponseEntity<WorkerProfileResponse> getMyProfile(
                        Authentication authentication) {

                Long userId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                workerService.getMyProfile(userId));
        }

        @GetMapping("/medical-records")
        public ResponseEntity<List<WorkerMedicalRecordResponse>> getMyMedicalRecords(
                        Authentication authentication) {

                Long userId = authenticatedUserService
                                .getUser(authentication)
                                .getId();

                return ResponseEntity.ok(
                                workerService.getMyMedicalRecords(userId));
        }
}