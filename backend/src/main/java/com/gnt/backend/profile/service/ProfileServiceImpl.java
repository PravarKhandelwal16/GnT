package com.gnt.backend.profile.service;

import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.profile.dto.UserProfileResponse;
import com.gnt.backend.profile.dto.UserProfileUpdateRequest;
import com.gnt.backend.profile.mapper.ProfileMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final ProfileMapper profileMapper;

    public ProfileServiceImpl(
            UserRepository userRepository,
            CreditHistoryRepository creditHistoryRepository,
            ProfileMapper profileMapper) {
        this.userRepository = userRepository;
        this.creditHistoryRepository = creditHistoryRepository;
        this.profileMapper = profileMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return profileMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPhone().equals(request.phone()) && userRepository.existsByPhone(request.phone())) {
            throw new RuntimeException("Phone number already exists");
        }

        user.setName(request.name());
        user.setPhone(request.phone());
        user.setStreet(request.street());
        user.setCity(request.city());
        user.setState(request.state());
        user.setPostalCode(request.postalCode());
        user.setCountry(request.country());
        user.setDateOfBirth(request.dateOfBirth());
        user.setProfileImage(request.profileImage());

        return profileMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CreditHistory> getCreditHistory(Long userId, Pageable pageable) {
        return creditHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
}
