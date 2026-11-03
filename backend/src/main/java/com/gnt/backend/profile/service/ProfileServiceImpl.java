package com.gnt.backend.profile.service;

import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.MediaType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.exception.ApiException;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.product.service.ImageKitService;
import com.gnt.backend.profile.dto.UserProfileResponse;
import com.gnt.backend.profile.dto.UserProfileUpdateRequest;
import com.gnt.backend.profile.mapper.ProfileMapper;
import com.gnt.backend.transaction.repository.TransactionRepository;
import com.gnt.backend.transaction.service.TransactionServiceImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;
    private final ImageKitService mediaService;
    private final PasswordEncoder passwordEncoder;
    private final ProfileMapper profileMapper;

    public ProfileServiceImpl(
            UserRepository userRepository,
            CreditHistoryRepository creditHistoryRepository,
            ProductRepository productRepository,
            TransactionRepository transactionRepository,
            ImageKitService mediaService,
            PasswordEncoder passwordEncoder,
            ProfileMapper profileMapper) {
        this.userRepository = userRepository;
        this.creditHistoryRepository = creditHistoryRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.mediaService = mediaService;
        this.passwordEncoder = passwordEncoder;
        this.profileMapper = profileMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        return profileMapper.toResponse(requireUser(userId));
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = requireUser(userId);

        if (!user.getPhone().equals(request.phone()) && userRepository.existsByPhone(request.phone())) {
            throw ApiException.conflict("Phone number already in use.");
        }

        user.setName(request.name());
        user.setPhone(request.phone());
        user.setStreet(request.street());
        user.setCity(request.city());
        user.setState(request.state());
        user.setPostalCode(request.postalCode());
        user.setCountry(request.country());
        if (request.dateOfBirth() != null) {
            user.setDateOfBirth(request.dateOfBirth());
        }

        return profileMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserProfileResponse updateAvatar(Long userId, MultipartFile file) {
        User user = requireUser(userId);
        ImageKitService.UploadResult result = mediaService.uploadMedia(file);
        if (result.type() != MediaType.IMAGE) {
            mediaService.deleteMedia(result.fileId());
            throw ApiException.badRequest("Profile pictures must be images");
        }
        user.setProfileImage(result.url());
        return profileMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = requireUser(userId);
        requirePassword(user, currentPassword);
        user.setPassword(passwordEncoder.encode(newPassword));
    }

    @Override
    @Transactional
    public void markWelcomeSeen(Long userId) {
        User user = requireUser(userId);
        user.setHasSeenWelcome(true);
        userRepository.save(user);
    }

    /**
     * Closes the account and removes personal details. The user row stays because ratings,
     * exchanges and the credit ledger reference it; replacing the email and phone frees
     * them for a future registration.
     */
    @Override
    @Transactional
    public void deleteAccount(Long userId, String password) {
        User user = requireUser(userId);
        requirePassword(user, password);

        if (transactionRepository.existsForUserInStatuses(userId, TransactionServiceImpl.OPEN_STATUSES)) {
            throw ApiException.conflict("Finish or cancel your open exchanges before deleting your account");
        }

        productRepository.updateStatusForOwner(userId, ProductStatus.ACTIVE, ProductStatus.DELETED);

        user.setStatus(UserStatus.DELETED);
        user.setName("Deleted user");
        user.setEmail("deleted-" + userId + "@deleted.invalid");
        user.setPhone("deleted-" + userId);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setStreet(null);
        user.setCity(null);
        user.setState(null);
        user.setPostalCode(null);
        user.setCountry(null);
        user.setDateOfBirth(null);
        user.setProfileImage(null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CreditHistory> getCreditHistory(Long userId, Pageable pageable) {
        return creditHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private void requirePassword(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw ApiException.badRequest("That password is incorrect");
        }
    }
}
