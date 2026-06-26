package com.gnt.backend.auth.dto;

/**
 * Response body returned after successful registration or login.
 * Contains the signed JWT that the client must include in subsequent requests.
 */
public record AuthenticationResponse(String token) {
}
