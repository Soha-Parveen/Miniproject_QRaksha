import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('qraksha.db');
    initDatabase(dbInstance);
  }
  return dbInstance;
};

export const initDatabase = (db: SQLite.SQLiteDatabase): void => {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

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

    CREATE TABLE IF NOT EXISTS wallet (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 10000.00 CHECK (balance >= 0),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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
      risk_reasons TEXT,
      status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'BLOCKED', 'CANCELLED')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      language TEXT NOT NULL DEFAULT 'en',
      voice_enabled INTEGER NOT NULL DEFAULT 1,
      biometric_enabled INTEGER NOT NULL DEFAULT 0,
      high_value_threshold REAL NOT NULL DEFAULT 50000.00,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS demo_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      demo_upi_id TEXT NOT NULL,
      avatar_color TEXT DEFAULT '#1E3A8A'
    );
  `);

  // Seed default settings row if missing
  const settingsRow = db.getFirstSync<{ id: number }>('SELECT id FROM settings WHERE id = 1');
  if (!settingsRow) {
    db.runSync(
      `INSERT INTO settings (id, language, voice_enabled, biometric_enabled, high_value_threshold)
       VALUES (1, 'en', 1, 0, 50000.00)`
    );
  }

  // Seed default demo wallet if missing
  const walletRow = db.getFirstSync<{ id: string }>('SELECT id FROM wallet WHERE id = "default_wallet"');
  if (!walletRow) {
    db.runSync(
      `INSERT INTO wallet (id, user_id, balance)
       VALUES ('default_wallet', 'user_primary', 10000.00)`
    );
  }

  // Seed demo contacts for contact selection feature
  const contactCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM demo_contacts');
  if (!contactCount || contactCount.count === 0) {
    const sampleContacts = [
      { id: 'c1', name: 'Ganesh General Store', phone: '9876543210', upi: 'ganesh.store@okaxis', color: '#1E3A8A' },
      { id: 'c2', name: 'Fresh Fruits & Veggies', phone: '9812345678', upi: 'freshfruits@upi', color: '#10B981' },
      { id: 'c3', name: 'Bangalore Dairy Milk', phone: '9765432109', upi: 'blrdairy@icici', color: '#F59E0B' },
      { id: 'c4', name: 'Sharma Sweets & Snacks', phone: '9900112233', upi: 'sharmasweets@paytm', color: '#EF4444' },
      { id: 'c5', name: 'Metro Pharmacy Chemist', phone: '9944556677', upi: 'metropharma@ybl', color: '#8B5CF6' },
    ];

    for (const c of sampleContacts) {
      db.runSync(
        `INSERT INTO demo_contacts (id, name, phone_number, demo_upi_id, avatar_color)
         VALUES (?, ?, ?, ?, ?)`,
        [c.id, c.name, c.phone, c.upi, c.color]
      );
    }
  }
};
