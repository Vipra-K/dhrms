package com.dhrms.dhrms_backend.dto.assignment;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DoctorWorkerResponse {

    private Long workerId;

    private String workerCode;

    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    private String phone;
}