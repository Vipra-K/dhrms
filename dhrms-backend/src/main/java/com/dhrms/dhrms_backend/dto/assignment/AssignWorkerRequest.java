package com.dhrms.dhrms_backend.dto.assignment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignWorkerRequest {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
}