package com.dhrms.dhrms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dhrms.dhrms_backend.dto.assignment.AssignWorkerRequest;
import com.dhrms.dhrms_backend.dto.assignment.AssignmentResponse;
import com.dhrms.dhrms_backend.dto.assignment.DoctorWorkerResponse;
import com.dhrms.dhrms_backend.dto.worker.WorkerResponse;
import com.dhrms.dhrms_backend.security.AuthenticatedUserService;
import com.dhrms.dhrms_backend.service.DoctorWorkerAssignmentService;
import com.dhrms.dhrms_backend.service.WorkerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DoctorWorkerAssignmentController {

        private final WorkerService workerService;
        private final DoctorWorkerAssignmentService assignmentService;

        private final AuthenticatedUserService authenticatedUserService;

        /*
         * HOSPITAL
         *
         * Assign or reassign a worker.
         */

        @PostMapping("/hospitals/workers/{workerId}/assignment")
        @PreAuthorize("hasRole('HOSPITAL')")
        public ResponseEntity<AssignmentResponse> assignWorker(
                        Authentication authentication,
                        @PathVariable Long workerId,
                        @Valid @RequestBody AssignWorkerRequest request) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                assignmentService.assignWorker(
                                                userId,
                                                workerId,
                                                request));
        }

        /*
         * HOSPITAL
         *
         * View current assignment.
         */
        @GetMapping("/hospitals/workers/{workerId}/assignment")
        @PreAuthorize("hasRole('HOSPITAL')")
        public ResponseEntity<AssignmentResponse> getWorkerAssignment(
                        Authentication authentication,
                        @PathVariable Long workerId) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                assignmentService.getWorkerAssignment(
                                                userId,
                                                workerId));
        }

        /*
         * DOCTOR
         *
         * Get all workers assigned to the
         * authenticated doctor.
         */
        @GetMapping("/doctors/me/workers")
        @PreAuthorize("hasRole('DOCTOR')")
        public ResponseEntity<List<DoctorWorkerResponse>> getMyWorkers(
                        Authentication authentication) {

                Long userId = getUserId(authentication);

                return ResponseEntity.ok(
                                assignmentService.getMyWorkers(
                                                userId));
        }

        @GetMapping("/doctors/me/workers/{workerId}")
        @PreAuthorize("hasRole('DOCTOR')")
        public ResponseEntity<WorkerResponse> getMyWorker(
                        Authentication authentication,
                        @PathVariable Long workerId) {

                Long doctorUserId = getUserId(authentication);

                assignmentService.verifyDoctorWorkerAccess(
                                doctorUserId,
                                workerId);

                return ResponseEntity.ok(
                                workerService.getWorkerForDoctor(workerId));
        }

        private Long getUserId(
                        Authentication authentication) {

                return authenticatedUserService
                                .getUser(authentication)
                                .getId();
        }
}