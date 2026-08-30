package com.dhrms.dhrms_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dhrms.dhrms_backend.dto.medical.MedicalRecordRequest;
import com.dhrms.dhrms_backend.dto.medical.MedicalRecordResponse;
import com.dhrms.dhrms_backend.dto.medical.PrescriptionRequest;
import com.dhrms.dhrms_backend.dto.medical.PrescriptionResponse;
import com.dhrms.dhrms_backend.security.AuthenticatedUserService;
import com.dhrms.dhrms_backend.service.MedicalRecordService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors/me")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    private final AuthenticatedUserService authenticatedUserService;

    // =========================================================
    // MEDICAL RECORDS
    // =========================================================

    @GetMapping("/workers/{workerId}/medical-records")
    public ResponseEntity<List<MedicalRecordResponse>> getWorkerMedicalRecords(
            Authentication authentication,
            @PathVariable Long workerId) {

        Long doctorUserId = getUserId(authentication);

        return ResponseEntity.ok(
                medicalRecordService
                        .getWorkerMedicalRecords(
                                doctorUserId,
                                workerId));
    }

    @PostMapping("/workers/{workerId}/medical-records")
    public ResponseEntity<MedicalRecordResponse> createMedicalRecord(
            Authentication authentication,
            @PathVariable Long workerId,
            @Valid @RequestBody MedicalRecordRequest request) {

        Long doctorUserId = getUserId(authentication);

        return ResponseEntity.ok(
                medicalRecordService
                        .createMedicalRecord(
                                doctorUserId,
                                workerId,
                                request));
    }

    @GetMapping("/medical-records/{recordId}")
    public ResponseEntity<MedicalRecordResponse> getMedicalRecord(
            Authentication authentication,
            @PathVariable Long recordId) {

        Long doctorUserId = getUserId(authentication);

        return ResponseEntity.ok(
                medicalRecordService
                        .getMedicalRecord(
                                doctorUserId,
                                recordId));
    }

    @PutMapping("/medical-records/{recordId}")
    public ResponseEntity<MedicalRecordResponse> updateMedicalRecord(
            Authentication authentication,
            @PathVariable Long recordId,
            @Valid @RequestBody MedicalRecordRequest request) {

        Long doctorUserId = getUserId(authentication);

        return ResponseEntity.ok(
                medicalRecordService
                        .updateMedicalRecord(
                                doctorUserId,
                                recordId,
                                request));
    }

    @DeleteMapping("/medical-records/{recordId}")
    public ResponseEntity<Void> deleteMedicalRecord(
            Authentication authentication,
            @PathVariable Long recordId) {

        Long doctorUserId = getUserId(authentication);

        medicalRecordService.deleteMedicalRecord(
                doctorUserId,
                recordId);

        return ResponseEntity.noContent()
                .build();
    }

    // =========================================================
    // PRESCRIPTIONS
    // =========================================================

    @GetMapping("/medical-records/{recordId}/prescriptions")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptions(
            Authentication authentication,
            @PathVariable Long recordId) {

        Long doctorUserId = getUserId(authentication);

        return ResponseEntity.ok(
                medicalRecordService
                        .getMedicalRecordPrescriptions(
                                doctorUserId,
                                recordId));
    }

    @PostMapping("/medical-records/{recordId}/prescriptions")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            Authentication authentication,
            @PathVariable Long recordId,
            @Valid @RequestBody PrescriptionRequest request) {

        Long doctorUserId = getUserId(authentication);

        return ResponseEntity.ok(
                medicalRecordService
                        .createPrescription(
                                doctorUserId,
                                recordId,
                                request));
    }

    @PutMapping("/prescriptions/{prescriptionId}")
    public ResponseEntity<PrescriptionResponse> updatePrescription(
            Authentication authentication,
            @PathVariable Long prescriptionId,
            @Valid @RequestBody PrescriptionRequest request) {

        Long doctorUserId = getUserId(authentication);

        return ResponseEntity.ok(
                medicalRecordService
                        .updatePrescription(
                                doctorUserId,
                                prescriptionId,
                                request));
    }

    @DeleteMapping("/prescriptions/{prescriptionId}")
    public ResponseEntity<Void> deletePrescription(
            Authentication authentication,
            @PathVariable Long prescriptionId) {

        Long doctorUserId = getUserId(authentication);

        medicalRecordService.deletePrescription(
                doctorUserId,
                prescriptionId);

        return ResponseEntity.noContent()
                .build();
    }

    private Long getUserId(
            Authentication authentication) {

        return authenticatedUserService
                .getUser(authentication)
                .getId();
    }
}