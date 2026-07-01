package com.gnt.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserProfileUpdateRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name cannot exceed 100 characters")
        String name,

        @NotBlank(message = "Phone is required")
        String phone,

        String street,
        String city,
        String state,
        String postalCode,
        String country,

        @NotNull(message = "Date of birth is required")
        LocalDate dateOfBirth,

        String profileImage
) {}
