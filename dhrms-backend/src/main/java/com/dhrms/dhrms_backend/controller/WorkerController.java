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

import com.dhrms.dhrms_backend.dto.worker.CreateWorkerRequest;
import com.dhrms.dhrms_backend.dto.worker.UpdateWorkerRequest;
import com.dhrms.dhrms_backend.dto.worker.WorkerQrLookupRequest;
import com.dhrms.dhrms_backend.dto.worker.WorkerQrResponse;
import com.dhrms.dhrms_backend.dto.worker.WorkerResponse;
import com.dhrms.dhrms_backend.entity.Worker;
import com.dhrms.dhrms_backend.security.AuthenticatedUserService;
import com.dhrms.dhrms_backend.service.WorkerQrService;
import com.dhrms.dhrms_backend.service.WorkerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hospitals/workers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOSPITAL')")
public class WorkerController {

        private final WorkerService workerService;

        private final WorkerQrService workerQrService;

        private final AuthenticatedUserService authenticatedUserService;

        @PostMapping("/{workerId}/qr")
        public ResponseEntity<WorkerQrResponse> generateQr(
                        Authentication authentication,
                        @PathVariable Long workerId) {

                getUserId(authentication);

                return ResponseEntity.ok(
                                workerQrService.generateQr(workerId));
        }

        @PostMapping("/qr/lookup")
        public ResponseEntity<WorkerResponse> lookupWorkerByQr(
                        Authentication authentication,
                        @Valid @RequestBody WorkerQrLookupRequest request) {

                Long userId = getUserId(authentication);

                Worker worker = workerQrService.getWorkerFromQr(
                                request.getQrContent());

                return ResponseEntity.ok(
                                workerService.getWorker(
                                                userId,
                                                worker.getId()));
        }

        @PostMapping
        public ResponseEntity<WorkerResponse> createWorker(
                        Authentication authentication,
                        @Valid @RequestBody CreateWorkerRequest request) {

                Long userId = getUserId(authentication);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(
                                                workerService.createWorker(
                                                                userId,
                                                                request));
        }

        @GetMapping
        public ResponseEntity<List<WorkerResponse>> getWorkers(
                        Authentication authentication) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                workerService.getWorkers(userId));
        }

        @GetMapping("/{workerId}")
        public ResponseEntity<WorkerResponse> getWorker(
                        Authentication authentication,
                        @PathVariable Long workerId) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                workerService.getWorker(
                                                userId,
                                                workerId));
        }

        @GetMapping("/code/{workerCode}")
        public ResponseEntity<WorkerResponse> getWorkerByCode(
                        Authentication authentication,
                        @PathVariable String workerCode) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                workerService.getWorkerByCode(
                                                userId,
                                                workerCode));
        }

        @PutMapping("/{workerId}")
        public ResponseEntity<WorkerResponse> updateWorker(
                        Authentication authentication,
                        @PathVariable Long workerId,
                        @Valid @RequestBody UpdateWorkerRequest request) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                workerService.updateWorker(
                                                userId,
                                                workerId,
                                                request));
        }

        @PatchMapping("/{workerId}/activate")
        public ResponseEntity<WorkerResponse> activateWorker(
                        Authentication authentication,
                        @PathVariable Long workerId) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                workerService.activateWorker(
                                                userId,
                                                workerId));
        }

        @PatchMapping("/{workerId}/deactivate")
        public ResponseEntity<WorkerResponse> deactivateWorker(
                        Authentication authentication,
                        @PathVariable Long workerId) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                workerService.deactivateWorker(
                                                userId,
                                                workerId));
        }

        private Long getUserId(
                        Authentication authentication) {

                return authenticatedUserService
                                .getUser(authentication)
                                .getId();
        }
}