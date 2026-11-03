-- Staff access: USER (members), MODERATOR (team), ADMIN (owner).
ALTER TABLE users
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

ALTER TABLE users
    ADD CONSTRAINT chk_users_role CHECK (role IN ('USER', 'MODERATOR', 'ADMIN'));

-- Who closed a report, when, and why.
ALTER TABLE reports
    ADD COLUMN resolution_note VARCHAR(500) NULL,
    ADD COLUMN resolved_by_id  BIGINT       NULL,
    ADD COLUMN resolved_at     DATETIME     NULL,
    ADD CONSTRAINT fk_reports_resolved_by FOREIGN KEY (resolved_by_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Append-only record of every staff action.
CREATE TABLE staff_audit_log
(
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    actor_id    BIGINT       NOT NULL,
    action      VARCHAR(40)  NOT NULL,
    target_type VARCHAR(20)  NOT NULL,
    target_id   BIGINT       NOT NULL,
    details     VARCHAR(1000) NOT NULL,
    created_at  DATETIME     NOT NULL,

    CONSTRAINT pk_staff_audit_log       PRIMARY KEY (id),
    CONSTRAINT fk_staff_audit_log_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT,

    INDEX idx_staff_audit_log_created (created_at),
    INDEX idx_staff_audit_log_target (target_type, target_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
