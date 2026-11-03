package com.gnt.backend.credit;

import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * The single way a balance changes after registration. Each call updates the balance
 * atomically and appends the matching ledger row in the caller's transaction, so the
 * balance and {@code credit_history} cannot disagree.
 */
@Service
public class CreditLedger {

    private final UserRepository userRepository;
    private final CreditHistoryRepository creditHistoryRepository;

    public CreditLedger(UserRepository userRepository, CreditHistoryRepository creditHistoryRepository) {
        this.userRepository = userRepository;
        this.creditHistoryRepository = creditHistoryRepository;
    }

    /**
     * @param amount signed change; zero is a no-op
     * @param insufficientMessage shown if the balance cannot cover a negative amount
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void apply(Long userId, int amount, CreditHistoryType type, String description,
                      Transaction transaction, String insufficientMessage) {
        if (amount == 0) {
            return;
        }
        if (userRepository.adjustBalance(userId, amount) == 0) {
            throw ApiException.conflict(insufficientMessage);
        }

        CreditHistory entry = new CreditHistory();
        entry.setUser(userRepository.getReferenceById(userId));
        entry.setTransaction(transaction);
        entry.setAmount(amount);
        entry.setTransactionType(type);
        entry.setDescription(description);
        creditHistoryRepository.save(entry);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void apply(Long userId, int amount, CreditHistoryType type, String description, Transaction transaction) {
        apply(userId, amount, type, description, transaction, "Insufficient credits");
    }
}
