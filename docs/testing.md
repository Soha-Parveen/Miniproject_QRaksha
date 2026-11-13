# QRaksha – Quality Assurance & Testing Plan

## 1. Testing Scope & Methodology
Every feature in QRaksha is subjected to:
1. **Unit & Logic Testing:** Testing deterministic functions (UPI parsing, fraud score calculation, hash generation).
2. **Integration Testing:** Testing state transitions between SQLite, SecureStore, and UI controllers.
3. **End-to-End User Journeys:** Full simulated payment flows from camera scan to receipt generation.
4. **Physical Device Testing:** Testing on a real Android smartphone (camera focus, torch, TTS accents, offline handling).

---

## 2. Test Matrices

### A. QR Code Parsing & Fraud Engine Test Suite

| Test Case ID | Test Payload / Description | Expected Category | Expected Reason / Flag |
| :--- | :--- | :--- | :--- |
| `TC-QR-01` | `upi://pay?pa=store@icici&pn=Fresh%20Mart&am=250&cu=INR` | 🟢 GREEN | Valid UPI format, payee name and amount present. |
| `TC-QR-02` | `upi://pay?pa=shopkeeper@okaxis&am=100&cu=INR` | 🟡 YELLOW | Payee name (`pn`) missing. Caution advised. |
| `TC-QR-03` | `upi://pay?pa=unknown@ybl` | 🟡 YELLOW | Amount missing, requires manual entry. |
| `TC-QR-04` | `upi://pay?pa=fraudulent.account#malicious@xyz` | 🔴 RED | Invalid characters in VPA handle. |
| `TC-QR-05` | `https://pay-rewards-claim.xyz/login?amount=500` | 🔴 RED | Non-UPI web URL disguised as payment prompt. |
| `TC-QR-06` | `upi://pay?pa=store@icici&pn=Jewellers&am=75000&cu=INR` | 🟡 / High-Value | Amount exceeds high-value threshold (₹50,000). |
| `TC-QR-07` | `WIFI:T:WPA;S:MyHomeWifi;P:Password123;;` | 🔴 RED | Non-payment QR code detected. |
| `TC-QR-08` | `upi://pay?pa=merchant@upi&pn=Store&am=-500&cu=INR` | 🔴 RED | Negative / malformed amount parameter. |

---

### B. Authentication & Security Test Suite

| Test Case ID | Action | Expected Behavior |
| :--- | :--- | :--- |
| `TC-AUTH-01` | First-time app launch | Redirect to Onboarding -> Create 4-digit Login PIN. |
| `TC-AUTH-02` | Login with correct PIN | Success -> Navigate to Dashboard. |
| `TC-AUTH-03` | Login with incorrect PIN 3 times | Increment counter, trigger progressive lockout timer (30s). |
| `TC-AUTH-04` | Biometric fingerprint success | Immediate login bypass of PIN entry. |
| `TC-AUTH-05` | Logout action | Clear active session state, require PIN on subsequent access. |

---

### C. Simulated Payment & Wallet Test Suite

| Test Case ID | Scenario | Expected Behavior |
| :--- | :--- | :--- |
| `TC-PAY-01` | Valid QR, ₹500 payment, correct Tx PIN | Deduct ₹500 from dummy wallet, log transaction, show Receipt. |
| `TC-PAY-02` | Payment amount > Available wallet balance | Prevent payment, display "Insufficient Wallet Balance" error. |
| `TC-PAY-03` | Invalid Transaction PIN | Deny deduction, show "Incorrect Transaction PIN" error. |
| `TC-PAY-04` | Critical Risk (🔴 RED) QR payment attempt | Block transaction completely with security rationale. |
| `TC-PAY-05` | Medium Risk (🟡 YELLOW) QR payment attempt | Require explicit safety checkbox acknowledgement before PIN. |
| `TC-PAY-06` | Duplicate tap on confirm button | Prevent double deduction via debouncing and idempotency lock. |

---

### D. Multilingual & Accessibility Test Suite

| Test Case ID | Language | Expected Verification |
| :--- | :--- | :--- |
| `TC-LANG-01` | English (`en`) | All screens, labels, and voice prompts rendered in English. |
| `TC-LANG-02` | Hindi (`hi`) | Full UI localized in Devanagari script, Hindi TTS audio output. |
| `TC-LANG-03` | Kannada (`kn`) | Full UI localized in Kannada script, Kannada TTS audio output. |
| `TC-LANG-04` | Malayalam (`ml`) | Full UI localized in Malayalam script, Malayalam TTS audio output. |
| `TC-TTS-01` | Device missing voice engine | Graceful fallback to visible banner without crash. |

