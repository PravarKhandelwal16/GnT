package com.gnt.backend.profile.controller;

import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.profile.dto.UserProfileResponse;
import com.gnt.backend.profile.dto.UserProfileUpdateRequest;
import com.gnt.backend.profile.service.ProfileService;
import com.gnt.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(profileService.getProfile(userPrincipal.getId()));
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UserProfileUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(profileService.updateProfile(userPrincipal.getId(), request));
    }

    @GetMapping("/credits")
    public ResponseEntity<Page<CreditHistory>> getMyCreditHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        return ResponseEntity.ok(profileService.getCreditHistory(userPrincipal.getId(), pageable));
    }

    @PostMapping("/mark-welcome-seen")
    public ResponseEntity<Void> markWelcomeSeen(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        profileService.markWelcomeSeen(userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/delete/request-otp")
    public ResponseEntity<java.util.Map<String, String>> requestAccountDeletionOtp(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String otp = profileService.requestAccountDeletion(userPrincipal.getId());
        // For the MVP, we return the OTP in the response for easy testing.
        return ResponseEntity.ok(java.util.Map.of("otp", otp, "message", "OTP sent successfully (mocked)"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> confirmAccountDeletion(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody java.util.Map<String, String> body) {
        String otp = body.get("otp");
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        profileService.confirmAccountDeletion(userPrincipal.getId(), otp);
        return ResponseEntity.ok().build();
    }
}
