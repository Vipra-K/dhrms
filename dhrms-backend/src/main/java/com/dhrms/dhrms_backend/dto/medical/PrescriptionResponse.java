package com.dhrms.dhrms_backend.dto.medical;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PrescriptionResponse {

    private Long id;

    private Long medicalRecordId;

    private Long workerId;

    private Long doctorId;

    private String medicineName;

    private String dosage;

    private String frequency;

    private String duration;

    private String instructions;

    private String filePath;

    private LocalDateTime createdAt;
}