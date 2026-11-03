package com.gnt.backend.auth.repository;

import com.gnt.backend.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Data access layer for {@link User} entities.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    /**
     * Applies a signed change to a balance as one atomic statement.
     *
     * @return 1 on success, 0 if the change would take the balance below zero
     */
    @Modifying
    @Query("UPDATE User u SET u.creditBalance = u.creditBalance + :delta " +
           "WHERE u.id = :userId AND u.creditBalance + :delta >= 0")
    int adjustBalance(@Param("userId") Long userId, @Param("delta") int delta);
}
