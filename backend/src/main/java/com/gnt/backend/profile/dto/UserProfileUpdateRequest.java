package com.gnt.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserProfileUpdateRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String name,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^\\+?[1-9]\\d{6,14}$", message = "Phone must be a valid international phone number")
        String phone,

        @Size(max = 255, message = "Street cannot exceed 255 characters")
        String street,

        @Size(max = 100, message = "City cannot exceed 100 characters")
        String city,

        @Size(max = 100, message = "State cannot exceed 100 characters")
        String state,

        @Size(max = 20, message = "Postal code cannot exceed 20 characters")
        String postalCode,

        @Size(max = 100, message = "Country cannot exceed 100 characters")
        String country,

        /* Optional: the stored value is kept when omitted. */
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth
) {}
