package com.dhrms.dhrms_backend.dto.worker;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WorkerResponse {

    private Long id;

    private String workerCode;

    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    private String phone;

    private String address;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String emergencyContactRelation;

    private Boolean active;

    private LocalDateTime createdAt;
    
    private Long assignedDoctorId;

private String assignedDoctorName;

private String assignedDoctorSpecialization;
    
}