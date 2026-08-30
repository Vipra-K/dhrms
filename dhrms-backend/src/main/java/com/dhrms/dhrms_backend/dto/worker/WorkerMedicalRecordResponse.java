package com.dhrms.dhrms_backend.dto.worker;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WorkerMedicalRecordResponse {

    private Long id;

    private LocalDate visitDate;

    private String hospitalName;

    private String doctorName;

    private String symptoms;

    private String diagnosis;

    private String treatment;

    private String notes;
}