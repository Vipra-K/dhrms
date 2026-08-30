package com.dhrms.dhrms_backend.dto.doctor;

import com.dhrms.dhrms_backend.entity.enums.DoctorRole;
import com.dhrms.dhrms_backend.entity.enums.DoctorStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DoctorResponse {

    private Long id;

    private String fullName;

    private String email;

    private String specialization;

    private String licenseNumber;

    private String department;

    private DoctorRole role;

    private DoctorStatus status;

    private Long hospitalId;
}