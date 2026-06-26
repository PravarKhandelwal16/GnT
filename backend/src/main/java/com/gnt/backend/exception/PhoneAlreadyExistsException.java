package com.gnt.backend.exception;

/**
 * Thrown during registration when a user with the same phone number already exists.
 */
public class PhoneAlreadyExistsException extends RuntimeException {

    public PhoneAlreadyExistsException(String phone) {
        super("Phone number already in use: " + phone);
    }
}
