package com.gnt.backend.exception;

/**
 * Thrown during registration when a user with the same email already exists.
 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("Email already in use: " + email);
    }
}
