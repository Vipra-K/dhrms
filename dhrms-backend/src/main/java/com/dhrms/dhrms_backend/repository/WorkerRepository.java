package com.dhrms.dhrms_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dhrms.dhrms_backend.entity.Worker;

public interface WorkerRepository
                extends JpaRepository<Worker, Long> {

        Optional<Worker> findByWorkerCode(String workerCode);

        Optional<Worker> findByUserId(Long userId);

        boolean existsByWorkerCode(String workerCode);

        List<Worker> findByFullNameContainingIgnoreCase(
                        String fullName);

        List<Worker> findByActiveTrue();
}