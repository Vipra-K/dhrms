package com.dhrms.dhrms_backend.dto.medical;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MedicalRecordResponse {

    private Long id;

    private Long workerId;

    private Long doctorId;

    private Long hospitalId;

    private LocalDate visitDate;

    private String symptoms;

    private String diagnosis;

    private String treatment;

    private String notes;

    private LocalDateTime createdAt;

    private List<PrescriptionResponse> prescriptions;
}