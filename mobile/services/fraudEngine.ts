import { parseUPIString } from './upiParser';
import { QRAnalysisResult, RiskIndicator, RiskCategory } from '../types';

// Plausible UPI VPA pattern: user@bankhandle (e.g. merchant@icici, 9876543210@paytm)
const UPI_VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z0-9]{2,50}$/;

// Known phishing keywords in transaction notes or URL parameters
const SUSPICIOUS_KEYWORDS = [
  'lottery',
  'winner',
  'claim',
  'cashback',
  'refund',
  'bonus',
  'urgent',
  'prize',
  'free-gift',
  'kyc-update',
  'electricity-bill-urgent',
];

// Suspicious URL top-level domains often used in scam campaigns
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.apk', '.buzz', '.icu', '.click', '.club'];

export const analyzeQRCode = (
  rawText: string,
  highValueThreshold: number = 50000.00
): QRAnalysisResult => {
  const parsed = parseUPIString(rawText);
  const indicators: RiskIndicator[] = [];
  let score = 0; // 0 (Clean) to 100 (Critical Risk)

  const timestamp = new Date().toISOString();

  // CHECK 1: Non-UPI or Malformed Scheme Check
  if (!parsed.isUpi) {
    const isHttp = /^https?:\/\//i.test(parsed.rawText);
    if (isHttp) {
      indicators.push({
        code: 'CRITICAL_HTTP_REDIRECT',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'Web URL disguised as payment QR code. Never make payments to external website links.',
        detail: parsed.rawText.substring(0, 60),
      });
      score += 90;
    } else {
      indicators.push({
        code: 'CRITICAL_NON_UPI_FORMAT',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'QR content does not follow the standard UPI payment protocol (upi://pay).',
        detail: parsed.rawText.substring(0, 40),
      });
      score += 85;
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
    score += 80;
  } else {
    // Check for forbidden characters in VPA (e.g. #, %, ?, !, multiple @)
    const atCount = (parsed.pa.match(/@/g) || []).length;
    if (atCount !== 1 || !UPI_VPA_REGEX.test(parsed.pa)) {
      indicators.push({
        code: 'CRITICAL_INVALID_VPA_SYNTAX',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'The UPI ID format is invalid or contains forbidden characters.',
        detail: parsed.pa,
      });
      score += 75;
    }
  }

  // CHECK 3: Payee Name (pn) Check
  if (!parsed.pn || parsed.pn.trim().length === 0) {
    indicators.push({
      code: 'CAUTION_MISSING_PAYEE_NAME',
      category: 'YELLOW',
      titleKey: 'analysis.yellowTitle',
      descriptionKey: 'Merchant / Payee Name is missing from the QR data. Always verify the receiver.',
    });
    score += 25;
  }

  // CHECK 4: Amount Validation (am)
  let parsedAmount = 0;
  let hasValidAmount = false;
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
      score += 70;
    } else {
      parsedAmount = num;
      hasValidAmount = true;

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
        score += 20;
      }
    }
  } else {
    // Missing amount is not critical in Indian UPI (user enters manually at merchant), but deserves a caution notice
    indicators.push({
      code: 'INFO_UNSPECIFIED_AMOUNT',
      category: 'YELLOW',
      titleKey: 'analysis.yellowTitle',
      descriptionKey: 'No pre-set amount specified. You will need to enter the payment amount manually.',
    });
    score += 10;
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
    score += 35;
  }

  // CHECK 6 & 9: Suspicious Keywords in Note (tn) or Embedded URL
  const noteLower = (parsed.tn || '').toLowerCase();
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (noteLower.includes(keyword)) {
      indicators.push({
        code: 'CRITICAL_SUSPICIOUS_KEYWORD',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: `Transaction note contains deceptive social-engineering keyword: "${keyword}".`,
        detail: parsed.tn,
      });
      score += 60;
      break;
    }
  }

  // Check embedded URL parameter
  if (parsed.url) {
    const urlLower = parsed.url.toLowerCase();
    const hasSuspiciousTld = SUSPICIOUS_TLDS.some((tld) => urlLower.includes(tld));
    if (hasSuspiciousTld) {
      indicators.push({
        code: 'CRITICAL_MALICIOUS_URL_PARAMETER',
        category: 'RED',
        titleKey: 'analysis.redTitle',
        descriptionKey: 'QR code contains an embedded link pointing to a suspicious or high-risk domain.',
        detail: parsed.url,
      });
      score += 75;
    }
  }

  // Determine Overall Risk Category
  let category: RiskCategory = 'GREEN';
  let summaryKey = 'analysis.greenMessage';
  let recommendationKey = 'analysis.greenDesc';

  const hasRedIndicator = indicators.some((i) => i.category === 'RED');
  const hasYellowIndicator = indicators.some((i) => i.category === 'YELLOW');

  if (hasRedIndicator || score >= 60) {
    category = 'RED';
    summaryKey = 'analysis.redMessage';
    recommendationKey = 'analysis.redDesc';
  } else if (hasYellowIndicator || score >= 15) {
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
