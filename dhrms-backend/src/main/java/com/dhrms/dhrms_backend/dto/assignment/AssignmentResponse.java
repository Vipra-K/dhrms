package com.dhrms.dhrms_backend.dto.assignment;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssignmentResponse {

    private Long id;

    private Long workerId;

    private String workerCode;

    private Long doctorId;

    private String doctorName;

    private String doctorSpecialization;

    private Long hospitalId;

    private Boolean active;

    private LocalDateTime assignedAt;
}