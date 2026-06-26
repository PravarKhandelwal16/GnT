package com.gnt.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request body for {@code POST /api/auth/register}.
 */
public record RegisterRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        String email,

        @NotBlank(message = "Phone is required")
        @Pattern(
                regexp = "^\\+?[1-9]\\d{6,14}$",
                message = "Phone must be a valid international phone number"
        )
        String phone,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 255, message = "Password must be at least 8 characters")
        String password,

        // Address fields — optional at registration
        String street,
        String city,
        String state,
        String postalCode,
        String country,

        @NotNull(message = "Date of birth is required")
        LocalDate dateOfBirth
) {
}
