package com.dhrms.dhrms_backend.dto.worker;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateWorkerRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 200)
    private String fullName;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100)
    private String password;

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