package com.gnt.backend.profile.controller;

import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.profile.dto.ChangePasswordRequest;
import com.gnt.backend.profile.dto.DeleteAccountRequest;
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
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileResponse> updateAvatar(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(profileService.updateAvatar(userPrincipal.getId(), file));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        profileService.changePassword(userPrincipal.getId(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        profileService.deleteAccount(userPrincipal.getId(), request.password());
        return ResponseEntity.noContent().build();
    }
}
