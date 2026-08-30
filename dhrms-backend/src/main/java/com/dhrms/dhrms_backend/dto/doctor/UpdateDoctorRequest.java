package com.dhrms.dhrms_backend.dto.doctor;

import com.dhrms.dhrms_backend.entity.enums.DoctorRole;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDoctorRequest {

    @Size(max = 200)
    private String fullName;

    @Size(max = 150)
    private String specialization;

    @Size(max = 100)
    private String licenseNumber;

    @Size(max = 100)
    private String department;

    private DoctorRole role;
}