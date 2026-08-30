package com.dhrms.dhrms_backend.dto.worker;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WorkerQrResponse {

    private Long workerId;

    private String workerCode;

    private String qrContent;

    private String qrImage;
}