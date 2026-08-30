package com.dhrms.dhrms_backend.dto.medical;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrescriptionRequest {

    @NotBlank(message = "Medicine name is required")
    @Size(max = 200)
    private String medicineName;

    @Size(max = 100)
    private String dosage;

    @Size(max = 100)
    private String frequency;

    @Size(max = 100)
    private String duration;

    @Size(max = 1000)
    private String instructions;
}