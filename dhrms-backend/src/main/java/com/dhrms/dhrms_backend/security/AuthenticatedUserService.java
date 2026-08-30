package com.dhrms.dhrms_backend.security;

import com.dhrms.dhrms_backend.entity.User;
import com.dhrms.dhrms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserService {

    private final UserRepository userRepository;

    public User getUser(Authentication authentication) {

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Authenticated user not found"));
    }
}