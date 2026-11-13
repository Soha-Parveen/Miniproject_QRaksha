import { analyzeQRCode } from '../services/fraudEngine';
import { parseUPIString } from '../services/upiParser';
import { sha256 } from '../services/crypto';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} - ${details || ''}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('       QRaksha Test Suite - Automated QA Tests        ');
console.log('======================================================\n');

// 1. UPI Parser Tests
console.log('--- 1. UPI URI Parser Verification ---');
const parsedValid = parseUPIString('upi://pay?pa=store@icici&pn=Fresh%20Mart&am=250.00&cu=INR&tn=Vegetables');
assert(parsedValid.isUpi === true, 'Parse valid UPI URI scheme');
assert(parsedValid.pa === 'store@icici', 'Extract Payee VPA address');
assert(parsedValid.pn === 'Fresh Mart', 'Extract Payee Name with URL decoding');
assert(parsedValid.am === '250.00', 'Extract Amount');
assert(parsedValid.cu === 'INR', 'Extract Currency code');
assert(parsedValid.tn === 'Vegetables', 'Extract Transaction Note');

const parsedHttp = parseUPIString('https://malicious-rewards.top/claim');
assert(parsedHttp.isUpi === false, 'Detect Non-UPI HTTP link correctly');

// 2. Fraud Engine Heuristics & Rules
console.log('\n--- 2. QR Fraud Detection Engine Verification ---');

// TC-QR-01: Valid UPI QR -> Green
const tc1 = analyzeQRCode('upi://pay?pa=store@icici&pn=Fresh%20Mart&am=250&cu=INR');
assert(tc1.category === 'GREEN', 'TC-QR-01: Valid UPI QR yields GREEN');
assert(tc1.score <= 15, 'TC-QR-01: Valid QR risk score is low (<=15)');

// TC-QR-02: Missing receiver name -> Yellow
const tc2 = analyzeQRCode('upi://pay?pa=shopkeeper@okaxis&am=100&cu=INR');
assert(tc2.category === 'YELLOW', 'TC-QR-02: Missing payee name yields YELLOW');
assert(tc2.indicators.some(i => i.code === 'CAUTION_MISSING_PAYEE_NAME'), 'TC-QR-02: Detected CAUTION_MISSING_PAYEE_NAME flag');

// TC-QR-03: Missing amount -> Yellow
const tc3 = analyzeQRCode('upi://pay?pa=merchant@ybl&pn=Superstore');
assert(tc3.indicators.some(i => i.code === 'INFO_UNSPECIFIED_AMOUNT'), 'TC-QR-03: Detected INFO_UNSPECIFIED_AMOUNT flag');

// TC-QR-04: Invalid characters in VPA -> Red
const tc4 = analyzeQRCode('upi://pay?pa=fraudulent.account#malicious@xyz&pn=Scam');
assert(tc4.category === 'RED', 'TC-QR-04: Forbidden character (#) in VPA yields RED');
assert(tc4.indicators.some(i => i.code === 'CRITICAL_INVALID_VPA_SYNTAX'), 'TC-QR-04: Detected CRITICAL_INVALID_VPA_SYNTAX');

// TC-QR-05: Web phishing link disguised as payment -> Red
const tc5 = analyzeQRCode('https://pay-rewards-claim.xyz/login?amount=500');
assert(tc5.category === 'RED', 'TC-QR-05: Non-UPI Phishing URL yields RED');
assert(tc5.indicators.some(i => i.code === 'CRITICAL_HTTP_REDIRECT'), 'TC-QR-05: Detected CRITICAL_HTTP_REDIRECT flag');

// TC-QR-06: High-Value Transaction -> Warning & Caution
const tc6 = analyzeQRCode('upi://pay?pa=store@icici&pn=Jewellers&am=75000&cu=INR', 50000);
assert(tc6.isHighValue === true, 'TC-QR-06: Flagged as High-Value (> ₹50,000)');
assert(tc6.indicators.some(i => i.code === 'CAUTION_HIGH_VALUE_TRANSACTION'), 'TC-QR-06: Detected CAUTION_HIGH_VALUE_TRANSACTION flag');

// TC-QR-07: Non-payment Wi-Fi string -> Red
const tc7 = analyzeQRCode('WIFI:T:WPA;S:MyHomeWifi;P:Password123;;');
assert(tc7.category === 'RED', 'TC-QR-07: Wi-Fi barcode yields RED');

// TC-QR-08: Malformed negative amount -> Red
const tc8 = analyzeQRCode('upi://pay?pa=merchant@upi&pn=Store&am=-500&cu=INR');
assert(tc8.category === 'RED', 'TC-QR-08: Negative payment amount yields RED');
assert(tc8.indicators.some(i => i.code === 'CRITICAL_MALFORMED_AMOUNT'), 'TC-QR-08: Detected CRITICAL_MALFORMED_AMOUNT');

// 3. Cryptographic Security Tests
console.log('\n--- 3. Cryptographic Integrity Verification ---');
const hash1 = sha256('1234:mysalt');
const hash2 = sha256('1234:mysalt');
const hashDifferent = sha256('1235:mysalt');
assert(hash1.length === 64, 'SHA-256 output is 64 hex characters (256 bits)');
assert(hash1 === hash2, 'SHA-256 output is strictly deterministic');
assert(hash1 !== hashDifferent, 'Different input yields completely different hash (avalanche effect)');

console.log('\n======================================================');
console.log(`Total Tests Run: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
