package com.gnt.backend.auth.service;

import com.gnt.backend.auth.dto.AuthenticationResponse;
import com.gnt.backend.auth.dto.LoginRequest;
import com.gnt.backend.auth.dto.RegisterRequest;

/**
 * Contract for authentication operations.
 */
public interface AuthService {

    /**
     * Registers a new user, assigns 350 initial credits, and returns a signed JWT.
     *
     * @param request the registration payload
     * @return an {@link AuthenticationResponse} containing the JWT
     */
    AuthenticationResponse register(RegisterRequest request);

    /**
     * Authenticates an existing user and returns a signed JWT.
     *
     * @param request the login payload
     * @return an {@link AuthenticationResponse} containing the JWT
     */
    AuthenticationResponse login(LoginRequest request);
}
