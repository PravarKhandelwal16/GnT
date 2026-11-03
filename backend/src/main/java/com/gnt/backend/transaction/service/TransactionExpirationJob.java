package com.gnt.backend.transaction.service;

import com.gnt.backend.transaction.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TransactionExpirationJob {

    private static final Logger log = LoggerFactory.getLogger(TransactionExpirationJob.class);

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    public TransactionExpirationJob(TransactionRepository transactionRepository,
                                    TransactionService transactionService) {
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
    }

    @Scheduled(cron = "*/30 * * * * *")
    public void processExpiredTransactions() {
        List<Long> dueIds = transactionRepository.findExpiredTransactionIds(
                LocalDateTime.now(), TransactionServiceImpl.OPEN_STATUSES);

        for (Long id : dueIds) {
            try {
                transactionService.settleIfExpired(id);
            } catch (Exception ex) {
                // One failure must not block the rest; the next run retries it.
                log.error("Could not settle expired transaction {}", id, ex);
            }
        }
    }
}
