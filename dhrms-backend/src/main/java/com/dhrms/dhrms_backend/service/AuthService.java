package com.dhrms.dhrms_backend.service;

import com.dhrms.dhrms_backend.dto.auth.AuthResponse;
import com.dhrms.dhrms_backend.dto.auth.LoginRequest;
import com.dhrms.dhrms_backend.entity.User;
import com.dhrms.dhrms_backend.repository.UserRepository;
import com.dhrms.dhrms_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final AuthenticationManager authenticationManager;

        private final UserRepository userRepository;

        private final JwtService jwtService;

        public AuthResponse login(
                        LoginRequest request) {

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                User user = userRepository
                                .findByEmail(request.getEmail())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User not found"));

                String token = jwtService.generateToken(
                                (org.springframework.security.core.userdetails.User) authentication.getPrincipal(),
                                user.getId());
                return AuthResponse.builder()
                                .token(token)
                                .userId(user.getId())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();
        }
}
