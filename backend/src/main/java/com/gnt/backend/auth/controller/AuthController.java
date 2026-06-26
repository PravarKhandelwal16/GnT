package com.gnt.backend.auth.controller;

import com.gnt.backend.auth.dto.AuthenticationResponse;
import com.gnt.backend.auth.dto.LoginRequest;
import com.gnt.backend.auth.dto.RegisterRequest;
import com.gnt.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Handles public authentication endpoints.
 *
 * <ul>
 *   <li>{@code POST /api/auth/register} — creates a new account and returns a JWT</li>
 *   <li>{@code POST /api/auth/login}    — validates credentials and returns a JWT</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthenticationResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthenticationResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
