package com.dhrms.dhrms_backend.entity;

import com.dhrms.dhrms_backend.entity.enums.DoctorRole;
import com.dhrms.dhrms_backend.entity.enums.DoctorStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors", indexes = {
        @Index(name = "idx_doctor_license", columnList = "license_number"),
        @Index(name = "idx_doctor_hospital", columnList = "hospital_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Doctor's authentication account.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /*
     * Every doctor belongs to exactly one hospital.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(length = 150)
    private String specialization;

    @Column(name = "license_number", unique = true, length = 100)
    private String licenseNumber;

    @Column(length = 100)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private DoctorRole role = DoctorRole.JUNIOR_DOCTOR;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DoctorStatus status = DoctorStatus.ACTIVE;

    @Column(name = "working_hours_start", length = 10)
    private String workingHoursStart;

    @Column(name = "working_hours_end", length = 10)
    private String workingHoursEnd;

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<DoctorWorkerAssignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "doctor", fetch = FetchType.LAZY)
    @Builder.Default
    private List<MedicalRecord> medicalRecords = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}