package com.gnt.backend.auth.service;

import com.gnt.backend.auth.dto.AuthenticationResponse;
import com.gnt.backend.auth.dto.LoginRequest;
import com.gnt.backend.auth.dto.RegisterRequest;
import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.exception.EmailAlreadyExistsException;
import com.gnt.backend.exception.PhoneAlreadyExistsException;
import com.gnt.backend.security.JwtService;
import com.gnt.backend.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link AuthService}.
 *
 * <h3>Registration flow</h3>
 * <ol>
 *   <li>Validate uniqueness of email and phone.</li>
 *   <li>Hash password with BCrypt.</li>
 *   <li>Persist {@link User} with {@code creditBalance = 350} and {@code status = ACTIVE}.</li>
 *   <li>Persist initial {@link CreditHistory} entry (type = INITIAL_BONUS).</li>
 *   <li>Generate and return a JWT.</li>
 * </ol>
 *
 * <h3>Login flow</h3>
 * <ol>
 *   <li>Delegate to {@link AuthenticationManager} — validates credentials, status, etc.</li>
 *   <li>Generate and return a JWT.</li>
 * </ol>
 */
@Service
public class AuthServiceImpl implements AuthService {

    private static final int INITIAL_CREDITS = 350;
    private static final String INITIAL_BONUS_DESCRIPTION = "Welcome bonus — initial credit allocation.";

    private final UserRepository userRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            CreditHistoryRepository creditHistoryRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.creditHistoryRepository = creditHistoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // ── Registration ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }
        if (userRepository.existsByPhone(request.phone())) {
            throw new PhoneAlreadyExistsException(request.phone());
        }

        User user = buildUser(request);
        userRepository.save(user);

        recordInitialBonus(user);

        String jwt = jwtService.generateToken(new UserPrincipal(user));
        return new AuthenticationResponse(jwt);
    }

    private User buildUser(RegisterRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email().toLowerCase().trim());
        user.setPhone(request.phone());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setStreet(request.street());
        user.setCity(request.city());
        user.setState(request.state());
        user.setPostalCode(request.postalCode());
        user.setCountry(request.country());
        user.setDateOfBirth(request.dateOfBirth());
        user.setCreditBalance(INITIAL_CREDITS);
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }

    private void recordInitialBonus(User user) {
        CreditHistory entry = new CreditHistory();
        entry.setUser(user);
        entry.setTransaction(null);
        entry.setAmount(INITIAL_CREDITS);
        entry.setTransactionType(CreditHistoryType.INITIAL_BONUS);
        entry.setDescription(INITIAL_BONUS_DESCRIPTION);
        creditHistoryRepository.save(entry);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Override
    public AuthenticationResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String jwt = jwtService.generateToken(principal);
        return new AuthenticationResponse(jwt);
    }
}
