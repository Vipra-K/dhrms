package com.dhrms.dhrms_backend.repository;

import com.dhrms.dhrms_backend.entity.WorkerQrCode;
import com.dhrms.dhrms_backend.entity.enums.QrStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkerQrCodeRepository
        extends JpaRepository<WorkerQrCode, Long> {

    Optional<WorkerQrCode> findByTokenHash(String tokenHash);

    Optional<WorkerQrCode> findByTokenHashAndStatus(
            String tokenHash,
            QrStatus status);

    Optional<WorkerQrCode> findByWorker_Id(Long workerId);

    boolean existsByWorker_Id(Long workerId);
}