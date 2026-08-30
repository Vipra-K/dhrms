package com.dhrms.dhrms_backend.dto.hospital;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterHospitalRequest {

    @NotBlank(message = "Hospital name is required")
    @Size(max = 200, message = "Hospital name must not exceed 200 characters")
    private String hospitalName;

    @NotBlank(message = "HFR ID is required")
    private String hfrId;

    @NotBlank(message = "Hospital code is required")
    @Size(max = 50, message = "Hospital code must not exceed 50 characters")
    private String hospitalCode;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    private String address;

    private String city;

    private String district;

    private String phone;
}