import { parseUPIString } from './upiParser';
import { QRAnalysisResult, RiskIndicator, RiskCategory } from '../types';
import {
  FRAUD_RULE_WEIGHTS,
  RISK_SCORE_THRESHOLDS,
  PROMOTIONAL_KEYWORDS,
  SUSPICIOUS_TLDS,
} from '../constants/securityRules';

// Standard UPI VPA format: user@bankhandle (e.g. freshmart@icici, 9876543210@paytm)
const UPI_VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z0-9]{2,50}$/;

export const analyzeQRCode = (
  rawText: string,
  highValueThreshold: number = RISK_SCORE_THRESHOLDS.DEFAULT_HIGH_VALUE_THRESHOLD
): QRAnalysisResult => {
  const parsed = parseUPIString(rawText);
  const indicators: RiskIndicator[] = [];
  let score = 0; // 0 (Clean) to 100 (Critical Risk)
  const timestamp = new Date().toISOString();

  // CHECK 1: Format & Protocol Check
  if (!parsed.isUpi) {
    const isHttp = /^https?:\/\//i.test(parsed.rawText);

    if (isHttp) {
      // Disguised Web URL -> Phishing Threat
      indicators.push({
        code: 'CRITICAL_HTTP_REDIRECT',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'Web URL disguised as payment QR code. Never make payments to external website links.',
        detail: parsed.rawText.substring(0, 60),
      });
      score += FRAUD_RULE_WEIGHTS.CRITICAL_HTTP_REDIRECT;
    } else {
      // Non-Payment Barcode (e.g., Wi-Fi configuration, vCard, general text)
      indicators.push({
        code: 'UNSUPPORTED_NON_PAYMENT_FORMAT',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'Unsupported QR code: This code does not contain standard UPI payment parameters.',
        detail: parsed.rawText.substring(0, 40),
      });
      score += FRAUD_RULE_WEIGHTS.UNSUPPORTED_NON_PAYMENT_FORMAT;
    }

    return {
      category: 'RED',
      score: Math.min(score, 100),
      summaryKey: 'analysis.redMessage',
      recommendationKey: 'analysis.redDesc',
      indicators,
      isHighValue: false,
      highValueThreshold,
      parsedParams: parsed,
      timestamp,
    };
  }

  // CHECK 2: Payee Address (VPA / UPI ID) Plausibility & Syntax
  if (!parsed.pa) {
    indicators.push({
      code: 'CRITICAL_MISSING_PA',
      category: 'RED',
      titleKey: 'analysis.redTitle',
      descriptionKey: 'Missing Payee Address (pa). Payment destination is unknown.',
    });
    score += FRAUD_RULE_WEIGHTS.CRITICAL_MISSING_PA;
  } else {
    const atCount = (parsed.pa.match(/@/g) || []).length;
    if (atCount !== 1 || !UPI_VPA_REGEX.test(parsed.pa)) {
      indicators.push({
        code: 'CRITICAL_INVALID_VPA_SYNTAX',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'The UPI ID format is invalid or contains forbidden characters (e.g., #, %, !, ?).',
        detail: parsed.pa,
      });
      score += FRAUD_RULE_WEIGHTS.CRITICAL_INVALID_VPA_SYNTAX;
    }
  }

  // CHECK 3: Payee Name (pn) Check
  if (!parsed.pn || parsed.pn.trim().length === 0) {
    indicators.push({
      code: 'CAUTION_MISSING_PAYEE_NAME',
      category: 'YELLOW',
      titleKey: 'analysis.yellowTitle',
      descriptionKey: 'Merchant / Payee Name is missing from the QR data. Always verify receiver details.',
    });
    score += FRAUD_RULE_WEIGHTS.CAUTION_MISSING_PAYEE_NAME;
  }

  // CHECK 4: Amount Validation (am)
  let parsedAmount = 0;
  let isHighValue = false;

  if (parsed.am !== undefined) {
    const num = parseFloat(parsed.am);
    if (isNaN(num) || num <= 0) {
      indicators.push({
        code: 'CRITICAL_MALFORMED_AMOUNT',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'The payment amount parameter is invalid, negative, or malformed.',
        detail: parsed.am,
      });
      score += FRAUD_RULE_WEIGHTS.CRITICAL_MALFORMED_AMOUNT;
    } else {
      parsedAmount = num;

      // CHECK 10: High-Value Transaction Warning
      if (parsedAmount >= highValueThreshold) {
        isHighValue = true;
        indicators.push({
          code: 'CAUTION_HIGH_VALUE_TRANSACTION',
          category: 'YELLOW',
          titleKey: 'analysis.yellowTitle',
          descriptionKey: `Transaction amount (₹${parsedAmount.toLocaleString('en-IN')}) exceeds the high-value safety threshold of ₹${highValueThreshold.toLocaleString('en-IN')}.`,
          detail: `₹${parsedAmount.toLocaleString('en-IN')}`,
        });
        score += FRAUD_RULE_WEIGHTS.CAUTION_HIGH_VALUE_TRANSACTION;
      }
    }
  } else {
    // Missing amount is common in merchant static QR stands (buyer enters amount)
    indicators.push({
      code: 'INFO_UNSPECIFIED_AMOUNT',
      category: 'YELLOW',
      titleKey: 'analysis.yellowTitle',
      descriptionKey: 'No pre-set amount specified. You will need to enter the payment amount manually.',
    });
    score += FRAUD_RULE_WEIGHTS.CAUTION_UNSPECIFIED_AMOUNT;
  }

  // CHECK 5: Currency Code Validation (cu)
  if (parsed.cu && parsed.cu !== 'INR') {
    indicators.push({
      code: 'CAUTION_NON_INR_CURRENCY',
      category: 'YELLOW',
      titleKey: 'analysis.yellowTitle',
      descriptionKey: `Unusual currency specified (${parsed.cu}). Standard Indian UPI transactions operate strictly in INR.`,
      detail: parsed.cu,
    });
    score += FRAUD_RULE_WEIGHTS.CAUTION_NON_INR_CURRENCY;
  }

  // CHECK 6 & 9: Contextual Social Engineering / Deceptive Keywords & Embedded URLs
  const noteLower = (parsed.tn || '').toLowerCase();
  let matchedKeyword: string | null = null;

  for (const keyword of PROMOTIONAL_KEYWORDS) {
    if (noteLower.includes(keyword)) {
      matchedKeyword = keyword;
      break;
    }
  }

  // Check embedded URL parameter
  let hasMaliciousUrl = false;
  if (parsed.url) {
    const urlLower = parsed.url.toLowerCase();
    hasMaliciousUrl = SUSPICIOUS_TLDS.some((tld) => urlLower.includes(tld));
    if (hasMaliciousUrl) {
      indicators.push({
        code: 'CRITICAL_MALICIOUS_URL_PARAMETER',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'QR code contains an embedded link pointing to a suspicious or high-risk domain.',
        detail: parsed.url,
      });
      score += FRAUD_RULE_WEIGHTS.CRITICAL_MALICIOUS_URL_TLD;
    }
  }

  // Contextual Evaluation of promotional keywords:
  if (matchedKeyword) {
    if (hasMaliciousUrl || !parsed.pn || (parsed.pa && !UPI_VPA_REGEX.test(parsed.pa))) {
      // High-risk combination: promotional lure + missing merchant or suspicious URL -> RED
      indicators.push({
        code: 'CRITICAL_SUSPICIOUS_PROMO_REDIRECT',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: `Transaction note contains deceptive keyword "${matchedKeyword}" alongside unverified receiver attributes.`,
        detail: parsed.tn,
      });
      score += 60;
    } else {
      // Contextual caution: valid merchant and legitimate UPI, but promotional note -> YELLOW caution
      indicators.push({
        code: 'CAUTION_PROMOTIONAL_NOTE_KEYWORD',
        category: 'YELLOW',
        titleKey: 'analysis.yellowTitle',
        descriptionKey: `Transaction note contains promotional keyword "${matchedKeyword}". Verify if this matches your purchase.`,
        detail: parsed.tn,
      });
      score += FRAUD_RULE_WEIGHTS.CAUTION_PROMOTIONAL_NOTE_KEYWORD;
    }
  }

  // Determine Overall Risk Category & Explainable Summary
  let category: RiskCategory = 'GREEN';
  let summaryKey = 'analysis.greenMessage';
  let recommendationKey = 'analysis.greenDesc';

  const hasRedIndicator = indicators.some((i) => i.category === 'RED');

  if (hasRedIndicator || score >= RISK_SCORE_THRESHOLDS.RED_MIN) {
    category = 'RED';
    summaryKey = 'analysis.redMessage';
    recommendationKey = 'analysis.redDesc';
  } else if (score >= RISK_SCORE_THRESHOLDS.YELLOW_MIN) {
    category = 'YELLOW';
    summaryKey = 'analysis.yellowMessage';
    recommendationKey = 'analysis.yellowDesc';
  } else {
    category = 'GREEN';
    summaryKey = 'analysis.greenMessage';
    recommendationKey = 'analysis.greenDesc';
  }

  return {
    category,
    score: Math.min(score, 100),
    summaryKey,
    recommendationKey,
    indicators,
    isHighValue,
    highValueThreshold,
    parsedParams: parsed,
    timestamp,
  };
};
