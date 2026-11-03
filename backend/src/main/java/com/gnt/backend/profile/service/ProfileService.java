package com.gnt.backend.profile.service;

import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.profile.dto.UserProfileResponse;
import com.gnt.backend.profile.dto.UserProfileUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.web.multipart.MultipartFile;

public interface ProfileService {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request);
    
    // Onboarding
    void markWelcomeSeen(Long userId);

    // Account Deletion
    UserProfileResponse updateAvatar(Long userId, MultipartFile file);
    void changePassword(Long userId, String currentPassword, String newPassword);
    void deleteAccount(Long userId, String password);

    Page<CreditHistory> getCreditHistory(Long userId, Pageable pageable);
}
