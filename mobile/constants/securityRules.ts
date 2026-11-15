/**
 * QRaksha Security Rules & Scoring Weights Configuration
 * Provides documented, configurable thresholds for the Heuristic Fraud Engine.
 */

export const FRAUD_RULE_WEIGHTS = {
  // Critical Failure Weights (Threshold for RED >= 60)
  CRITICAL_HTTP_REDIRECT: 90,
  CRITICAL_MALICIOUS_URL_TLD: 85,
  CRITICAL_INVALID_VPA_SYNTAX: 75,
  CRITICAL_MALFORMED_AMOUNT: 75,
  CRITICAL_MISSING_PA: 80,

  // Contextual Warning Weights (Cumulative YELLOW 16 - 59)
  CAUTION_MISSING_PAYEE_NAME: 25,
  CAUTION_HIGH_VALUE_TRANSACTION: 25,
  CAUTION_NON_INR_CURRENCY: 35,
  CAUTION_UNSPECIFIED_AMOUNT: 10,
  CAUTION_PROMOTIONAL_NOTE_KEYWORD: 25,

  // Unsupported QR format (Non-payment barcode)
  UNSUPPORTED_NON_PAYMENT_FORMAT: 85,
} as const;

export const RISK_SCORE_THRESHOLDS = {
  GREEN_MAX: 15,       // 0 - 15: Safe, no suspicious indicators found
  YELLOW_MIN: 16,
  YELLOW_MAX: 59,      // 16 - 59: Caution, verify receiver carefully
  RED_MIN: 60,         // 60 - 100: Critical Risk, payment blocked
  DEFAULT_HIGH_VALUE_THRESHOLD: 50000.00,
} as const;

// Deceptive / Social Engineering Keywords for contextual scrutiny
export const PROMOTIONAL_KEYWORDS = [
  'lottery',
  'winner',
  'claim',
  'cashback',
  'refund',
  'bonus',
  'prize',
  'free-gift',
  'kyc-update',
  'electricity-bill-urgent',
] as const;

// High-Risk Suspicious Top-Level Domains used in mobile phishing
export const SUSPICIOUS_TLDS = [
  '.xyz',
  '.top',
  '.apk',
  '.buzz',
  '.icu',
  '.click',
  '.club',
  '.loan',
  '.work',
] as const;

