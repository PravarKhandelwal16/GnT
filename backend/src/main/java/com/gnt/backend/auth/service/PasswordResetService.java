package com.gnt.backend.auth.service;

import com.gnt.backend.auth.repository.PasswordResetTokenRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.PasswordResetToken;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_MINUTES = 30;

    private final SecureRandom random = new SecureRandom();
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String mailHost;
    private final String frontendUrl;
    private final String fromAddress;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                ObjectProvider<JavaMailSender> mailSender,
                                @Value("${spring.mail.host:}") String mailHost,
                                @Value("${application.frontend-url}") String frontendUrl,
                                @Value("${application.mail.from}") String fromAddress) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.mailHost = mailHost;
        this.frontendUrl = com.gnt.backend.config.PublicUrls.withScheme(frontendUrl);
        this.fromAddress = fromAddress;
    }

    /** Silent when the email is unknown, so this can't be used to discover accounts. */
    @Transactional
    public void requestReset(String email) {
        userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .ifPresent(this::issueToken);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken reset = tokenRepository.findByTokenHash(sha256(token))
                .filter(t -> t.getUsedAt() == null && t.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> ApiException.badRequest("This reset link is invalid or has expired"));

        reset.setUsedAt(LocalDateTime.now());
        User user = reset.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
    }

    private void issueToken(User user) {
        tokenRepository.invalidateOutstanding(user.getId(), LocalDateTime.now());

        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        PasswordResetToken reset = new PasswordResetToken();
        reset.setUser(user);
        reset.setTokenHash(sha256(token));
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_MINUTES));
        tokenRepository.save(reset);

        send(user, frontendUrl + "/reset-password?token=" + token);
    }

    private void send(User user, String link) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || mailHost.isBlank()) {
            log.warn("SMTP not configured. Password reset link for user {}: {}", user.getId(), link);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("Reset your Give & Take password");
        message.setText("Hi " + user.getName() + ",\n\n"
                + "Use this link to choose a new password. It works once and expires in "
                + TOKEN_MINUTES + " minutes:\n\n" + link + "\n\n"
                + "If you didn't ask for this, you can ignore this email.");
        sender.send(message);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
