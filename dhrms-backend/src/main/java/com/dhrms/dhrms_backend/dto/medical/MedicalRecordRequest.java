package com.dhrms.dhrms_backend.dto.medical;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicalRecordRequest {

    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;

    @Size(max = 2000, message = "Symptoms cannot exceed 2000 characters")
    private String symptoms;

    @NotBlank(message = "Diagnosis is required")
    @Size(max = 2000, message = "Diagnosis cannot exceed 2000 characters")
    private String diagnosis;

    @Size(max = 3000, message = "Treatment cannot exceed 3000 characters")
    private String treatment;

    @Size(max = 5000, message = "Notes cannot exceed 5000 characters")
    private String notes;
}