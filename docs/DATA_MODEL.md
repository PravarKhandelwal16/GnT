# Data model

Ten tables. Every row has a numeric `id` and a `created_at`; times are stored in UTC.
Nothing a member creates is ever physically deleted: rows change `status` instead, so history stays intact.

```
users ──< products ──< product_media
  │          │
  │          ├──< transactions >── users (buyer and seller)
  │          │          │
  │          │          └──< ratings
  │          ├──< reports
  │          └──< saved_products
  ├──< credit_history (one row per balance change)
  ├──< password_reset_tokens
  └──< staff_audit_log (actor)
```

## Tables

| Table | One row is | Key columns |
|---|---|---|
| `users` | A member or staff account | `role` USER / MODERATOR / ADMIN · `status` ACTIVE / SUSPENDED / DELETED · `credit_balance` |
| `products` | A listing | `status` (see below) · `credit_value` · `listing_bonus` (credits actually paid for listing it) |
| `product_media` | One photo or video of a listing | `media_url` · `is_primary` · `display_order` |
| `transactions` | One reservation, from start to finish | `buyer_id` · `seller_id` · `credits_used` · `qr_token` (handover code) · `status` · `expires_at` |
| `credit_history` | One change to one balance | signed `amount` · `transaction_type` · `description` |
| `ratings` | One person rating the other after an exchange | 1 to 5, one per person per exchange |
| `reports` | A member flagging a listing | `status` OPEN / CLOSED · `resolution_note` · `resolved_by_id` |
| `saved_products` | A bookmark | unique per member and listing |
| `password_reset_tokens` | One reset link | only a SHA-256 hash of the link is stored; single use, 30 minutes |
| `staff_audit_log` | One staff action | `actor_id` · `action` · `target_type` + `target_id` · `details` |

## Statuses

**Listing (`products.status`)**: `ACTIVE` (live) → `LOCKED` (reserved) → `EXCHANGED`.
A reservation that is cancelled or expires goes back to `ACTIVE`. The owner removing it gives `DELETED`; staff removing it gives `REJECTED`, which staff can restore.

**Exchange (`transactions.status`)**: `INITIATED` → `WAITING_CONFIRMATION` (someone confirmed) → `COMPLETED`, or `CANCELLED` / `EXPIRED`.

## Rules the data always follows

1. **The ledger explains every balance.** A member's balance always equals the sum of their `credit_history` amounts. Balances change only through `CreditLedger`, which writes the history row in the same database transaction.
2. **A balance never goes below zero.** The database enforces this (`chk_users_balance`).
3. **A seller earns exactly what the buyer paid:** `listing_bonus` when listing, plus `credits_used − listing_bonus` on completion.
4. **One open exchange per listing.** The listing's `version` column rejects a second reservation made at the same moment.
5. **Every staff action is in `staff_audit_log`**, written in the same transaction as the action itself.

## Looking at the data

- **Local H2 profile:** open `http://localhost:<backend port>/h2-console`, with JDBC URL `jdbc:h2:file:./data/gnt-local`, user `sa` and an empty password. To start fresh, stop the backend and delete `backend/data/`.
- **MySQL:** any client against the database from `backend/.env`. Schema changes go in a new file in `backend/src/main/resources/db/migration`; never edit one that has already run.
- **In the app:** owners and the team get the staff workspace at `/admin`.
