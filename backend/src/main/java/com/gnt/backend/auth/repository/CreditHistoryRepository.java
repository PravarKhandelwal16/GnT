package com.gnt.backend.auth.repository;

import com.gnt.backend.domain.entity.CreditHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data access layer for {@link CreditHistory} entries.
 * Credit history is append-only — no update or delete operations are exposed.
 */
public interface CreditHistoryRepository extends JpaRepository<CreditHistory, Long> {
    Page<CreditHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
