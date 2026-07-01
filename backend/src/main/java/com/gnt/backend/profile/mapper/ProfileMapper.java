package com.gnt.backend.profile.mapper;

import com.gnt.backend.domain.entity.User;
import com.gnt.backend.profile.dto.UserProfileResponse;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getStreet(),
                user.getCity(),
                user.getState(),
                user.getPostalCode(),
                user.getCountry(),
                user.getDateOfBirth(),
                user.getProfileImage(),
                user.getCreditBalance(),
                user.getRating() != null ? user.getRating().doubleValue() : 0.0,
                user.isEmailVerified(),
                user.isPhoneVerified(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
