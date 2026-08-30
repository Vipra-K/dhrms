package com.dhrms.dhrms_backend.dto.worker;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkerQrLookupRequest {

    @NotBlank(message = "QR content is required")
    private String qrContent;
}