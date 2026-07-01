package com.gnt.backend.profile.dto;

import com.gnt.backend.domain.enums.UserStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        String phone,
        String street,
        String city,
        String state,
        String postalCode,
        String country,
        LocalDate dateOfBirth,
        String profileImage,
        Integer creditBalance,
        Double rating,
        Boolean emailVerified,
        Boolean phoneVerified,
        UserStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
