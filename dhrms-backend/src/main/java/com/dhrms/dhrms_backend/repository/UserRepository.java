package com.dhrms.dhrms_backend.repository;

import com.dhrms.dhrms_backend.entity.User;
import com.dhrms.dhrms_backend.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndRole(
            String email,
            UserRole role);
}