package com.dhrms.dhrms_backend.dto.doctor;

import com.dhrms.dhrms_backend.entity.enums.DoctorRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDoctorRequest {

    @NotBlank(message = "Doctor name is required")
    @Size(max = 200)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100)
    private String password;

    @Size(max = 150)
    private String specialization;

    @Size(max = 100)
    private String licenseNumber;

    @Size(max = 100)
    private String department;

    private DoctorRole role;
}