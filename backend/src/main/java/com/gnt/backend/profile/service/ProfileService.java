package com.gnt.backend.profile.service;

import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.profile.dto.UserProfileResponse;
import com.gnt.backend.profile.dto.UserProfileUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProfileService {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request);
    
    // Onboarding
    void markWelcomeSeen(Long userId);

    // Account Deletion
    String requestAccountDeletion(Long userId);
    void confirmAccountDeletion(Long userId, String otp);

    Page<CreditHistory> getCreditHistory(Long userId, Pageable pageable);
}
