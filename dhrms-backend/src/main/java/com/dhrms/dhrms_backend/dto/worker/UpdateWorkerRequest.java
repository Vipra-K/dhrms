package com.dhrms.dhrms_backend.dto.worker;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkerRequest {

    @Size(max = 200)
    private String fullName;

    private LocalDate dateOfBirth;

    @Size(max = 20)
    private String gender;

    @Size(max = 10)
    private String bloodGroup;

    @Size(max = 20)
    private String phone;

    @Size(max = 300)
    private String address;

    @Size(max = 150)
    private String emergencyContactName;

    @Size(max = 20)
    private String emergencyContactPhone;

    @Size(max = 50)
    private String emergencyContactRelation;
}