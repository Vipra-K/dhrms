package com.dhrms.dhrms_backend.controller;

import com.dhrms.dhrms_backend.dto.auth.AuthResponse;
import com.dhrms.dhrms_backend.dto.auth.LoginRequest;
import com.dhrms.dhrms_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request));
    }
}