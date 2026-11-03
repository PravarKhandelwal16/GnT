package com.gnt.backend.admin;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.enums.Role;
import com.gnt.backend.domain.enums.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Owner accounts come from OWNER_EMAILS. An address on the list becomes an owner when it signs up,
 * and existing accounts on the list are promoted at startup. After that, owners manage roles in
 * the staff workspace.
 */
@Component
public class OwnerBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OwnerBootstrap.class);

    private final UserRepository userRepository;
    private final Set<String> ownerEmails;

    public OwnerBootstrap(UserRepository userRepository, @Value("${application.owner-emails:}") String ownerEmails) {
        this.userRepository = userRepository;
        this.ownerEmails = Arrays.stream(ownerEmails.split(","))
                .map(email -> email.trim().toLowerCase(Locale.ROOT))
                .filter(email -> !email.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean isOwnerEmail(String email) {
        return email != null && ownerEmails.contains(email.trim().toLowerCase(Locale.ROOT));
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (ownerEmails.isEmpty()) {
            log.info("OWNER_EMAILS is empty; no owner accounts will be created automatically");
            return;
        }
        ownerEmails.forEach(email -> userRepository.findByEmail(email).ifPresentOrElse(user -> {
            if (user.getStatus() == UserStatus.ACTIVE && user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                log.info("Granted owner access to user {}", user.getId());
            }
        }, () -> log.info("An OWNER_EMAILS address has no account yet; it becomes an owner on sign-up")));
    }
}
