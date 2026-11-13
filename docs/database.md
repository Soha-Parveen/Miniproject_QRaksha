# QRaksha – Database Schema & Data Integrity Design

## 1. Overview
QRaksha uses a local **SQLite** database (`qraksha.db`) embedded on the Android device via `expo-sqlite`. All operations requiring state changes to the wallet and transaction records execute inside atomic ACID transactions.

---

## 2. Entity Relationship Diagram (ERD)

```
 +--------------------+           +--------------------+
 |       users        | 1       1 |       wallet       |
 +--------------------+-----------+--------------------+
 | id (PK)            |           | id (PK)            |
 | username           |           | user_id (FK)       |
 | login_pin_hash     |           | balance            |
 | tx_pin_hash        |           | updated_at         |
 | salt               |           +--------------------+
 | created_at         |
 +--------------------+
           | 1
           |
           | *
 +--------------------+           +--------------------+
 |    transactions    |           |      settings      |
 +--------------------+           +--------------------+
 | id (PK)            |           | id (PK)            |
 | transaction_ref    |           | language           |
 | receiver_name      |           | voice_enabled      |
 | upi_id             |           | biometric_enabled  |
 | amount             |           | high_val_threshold |
 | currency           |           | updated_at         |
 | transaction_note   |           +--------------------+
 | risk_category      |
 | risk_score         |           +--------------------+
 | risk_reasons       |           |   demo_contacts    |
 | status             |           +--------------------+
 | created_at         |           | id (PK)            |
 +--------------------+           | name               |
                                  | phone_number       |
                                  | demo_upi_id        |
                                  | avatar_color       |
                                  +--------------------+
```

---

## 3. Detailed Table Specifications

### A. `users`
Stores user profile information and cryptographic hashes of credentials.
```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    login_pin_hash TEXT NOT NULL,
    tx_pin_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_until TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### B. `wallet`
Maintains the demonstration balance. Default starting balance is ₹10,000.
```sql
CREATE TABLE IF NOT EXISTS wallet (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 10000.00 CHECK (balance >= 0),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### C. `transactions`
Immutable audit log of all simulated payment attempts.
```sql
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    transaction_ref TEXT UNIQUE NOT NULL,
    receiver_name TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    transaction_note TEXT,
    risk_category TEXT NOT NULL CHECK (risk_category IN ('GREEN', 'YELLOW', 'RED')),
    risk_score INTEGER NOT NULL,
    risk_reasons TEXT, -- JSON array of strings
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'BLOCKED', 'CANCELLED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
```

### D. `settings`
User preferences for language, voice accessibility, and security thresholds.
```sql
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Single row configuration
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'kn', 'ml')),
    voice_enabled INTEGER NOT NULL DEFAULT 1 CHECK (voice_enabled IN (0, 1)),
    biometric_enabled INTEGER NOT NULL DEFAULT 0 CHECK (biometric_enabled IN (0, 1)),
    high_value_threshold REAL NOT NULL DEFAULT 50000.00 CHECK (high_value_threshold >= 1000),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### E. `demo_contacts`
Pre-seeded contacts with simulated UPI IDs for contact-based payment testing.
```sql
CREATE TABLE IF NOT EXISTS demo_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    demo_upi_id TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#1E3A8A'
);
```

---

## 4. Atomic Payment Transaction Pattern
To prevent race conditions and duplicate deductions:
```sql
BEGIN TRANSACTION;

-- 1. Verify and decrement balance (enforced by CHECK (balance >= 0))
UPDATE wallet 
SET balance = balance - :amount, updated_at = datetime('now')
WHERE user_id = :user_id AND balance >= :amount;

-- 2. Record transaction receipt
INSERT INTO transactions (
    id, transaction_ref, receiver_name, upi_id, amount, currency,
    transaction_note, risk_category, risk_score, risk_reasons, status
) VALUES (
    :id, :ref, :receiver_name, :upi_id, :amount, 'INR',
    :note, :risk_category, :risk_score, :risk_reasons, 'SUCCESS'
);

COMMIT;
```

