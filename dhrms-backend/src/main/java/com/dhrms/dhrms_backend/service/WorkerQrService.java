package com.dhrms.dhrms_backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dhrms.dhrms_backend.dto.worker.WorkerQrResponse;
import com.dhrms.dhrms_backend.entity.Worker;
import com.dhrms.dhrms_backend.entity.WorkerQrCode;
import com.dhrms.dhrms_backend.entity.enums.QrStatus;
import com.dhrms.dhrms_backend.repository.WorkerQrCodeRepository;
import com.dhrms.dhrms_backend.repository.WorkerRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkerQrService {

    private final WorkerRepository workerRepository;

    private final WorkerQrCodeRepository workerQrCodeRepository;

    @Transactional
    public WorkerQrResponse generateQr(Long workerId) {

        Worker worker = workerRepository
                .findById(workerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Worker not found"
                        )
                );

        /*
         * Revoke existing QR if one exists.
         */
        workerQrCodeRepository
                .findByWorker_Id(workerId)
                .ifPresent(existing -> {
                    existing.setStatus(QrStatus.REVOKED);
                    existing.setRevokedAt(
                            java.time.LocalDateTime.now()
                    );
                    workerQrCodeRepository.save(existing);
                });

        /*
         * Generate an opaque random token.
         */
        String rawToken =
                UUID.randomUUID().toString()
                        .replace("-", "");

        String tokenHash = hashToken(rawToken);

        WorkerQrCode qrCode = WorkerQrCode.builder()
                .worker(worker)
                .tokenHash(tokenHash)
                .status(QrStatus.ACTIVE)
                .build();

        workerQrCodeRepository.save(qrCode);

        /*
         * The QR contains only the opaque token.
         */
        String qrContent = "DHRMS:" + rawToken;

        String qrImage = generateQrImage(qrContent);

        return WorkerQrResponse.builder()
                .workerId(worker.getId())
                .workerCode(worker.getWorkerCode())
                .qrContent(qrContent)
                .qrImage(qrImage)
                .build();
    }

    @Transactional(readOnly = true)
    public Worker getWorkerFromQr(String qrContent) {

        if (
                qrContent == null
                        || !qrContent.startsWith("DHRMS:")
        ) {
            throw new IllegalArgumentException(
                    "Invalid DHRMS QR code"
            );
        }

        String rawToken =
                qrContent.substring("DHRMS:".length());

        String tokenHash = hashToken(rawToken);

        WorkerQrCode qrCode =
                workerQrCodeRepository
                        .findByTokenHashAndStatus(
                                tokenHash,
                                QrStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid or revoked QR code"
                                )
                        );

        return qrCode.getWorker();
    }

    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return Base64.getEncoder()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    e
            );
        }
    }

    private String generateQrImage(
            String content
    ) {

        try {

            QRCodeWriter writer =
                    new QRCodeWriter();

            BitMatrix matrix =
                    writer.encode(
                            content,
                            BarcodeFormat.QR_CODE,
                            400,
                            400
                    );

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            MatrixToImageWriter.writeToStream(
                    matrix,
                    "PNG",
                    output
            );

            return "data:image/png;base64," +
                    Base64.getEncoder()
                            .encodeToString(
                                    output.toByteArray()
                            );

        } catch (
                WriterException |
                IOException e
        ) {

            throw new IllegalStateException(
                    "Failed to generate QR code",
                    e
            );
        }
    }
}