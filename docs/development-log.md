# QRaksha – Development Log & Milestone Tracker

## Phase 1: Project Foundation & Architecture (COMPLETED & VERIFIED)
- [x] Initialized Git repository on `main` branch.
- [x] Configured remote origin: `https://github.com/Soha-Parveen/Miniproject_QRaksha.git`.
- [x] Configured production-grade `.gitignore` and `.env.example`.
- [x] Created architectural blueprints & system design documentation:
  - `docs/architecture.md` (System components & data flow)
  - `docs/database.md` (SQLite schema design & integrity rules)
  - `docs/api.md` (Auxiliary REST API contract)
  - `docs/testing.md` (QA test matrix & verification suites)
  - `docs/development-log.md` (Phase & commit tracker)
  - `README.md` (Complete project manual & setup instructions)
- [x] Built auxiliary Express backend with TypeScript, health check (`GET /api/health`), security middleware (`helmet`, `cors`, `express-rate-limit`), and dev-mode OTP generation.
- [x] Initialized Expo React Native client with TypeScript, Expo Router v4, and React Native Paper.
- [x] Implemented theme design system (`constants/theme.ts`) with Navy Blue (`#0A1E3F`), Emerald (`#10B981`), Amber (`#F59E0B`), Crimson (`#EF4444`), and typography.

---

## Phase 2: Authentication & Security (COMPLETED & VERIFIED)
- [x] Implemented standard SHA-256 cryptographic hashing with device-specific salts (`services/crypto.ts`).
- [x] Built 4-digit Login PIN and Transaction PIN setup with confirmation (`app/(auth)/create-pin.tsx`).
- [x] Built Login screen with PIN keypad, biometric unlock support, failed-attempt tracking, and 30-second progressive lockout protection (`app/(auth)/login.tsx`).
- [x] Built development-mode OTP recovery flow adhering to transparency guidelines (`app/(auth)/forgot-pin.tsx`).

---

## Phase 3: Dashboard & Dummy Wallet (COMPLETED & VERIFIED)
- [x] Built financial dashboard with demonstration balance card (starting balance: ₹10,000) (`app/(tabs)/index.tsx`).
- [x] Implemented "+ Add Demo ₹5,000" feature (`database/walletRepo.ts`).
- [x] Built active security shield banner, rotating safety tips card, and recent activity list.

---

## Phase 4 & 5: QR Scanner & Fraud Detection Engine (COMPLETED & VERIFIED)
- [x] Implemented live camera viewfinder with `CameraView` from `expo-camera`, reticle frame, torch toggle, and debounced scanning lock (`app/(tabs)/scan.tsx`).
- [x] Implemented gallery QR image selection via `expo-image-picker`.
- [x] Implemented contact selector with pre-seeded demo merchants (`database/contactRepo.ts`).
- [x] Engineered rule-based QR fraud detection engine (`services/fraudEngine.ts`) with 10 checks:
  1. URI scheme validation (`upi://pay`).
  2. Payee VPA plausibility & forbidden character checks (`#`, `%`, `!`, multiple `@`).
  3. Missing merchant name flag (`pn`).
  4. Missing amount caution flag (`am`).
  5. Negative / malformed amount detection.
  6. Currency validation (`cu = INR`).
  7. Social-engineering phishing keyword detection in notes (`tn`).
  8. Malicious top-level domain checks in embedded URLs (`.xyz`, `.top`, `.apk`).
  9. Non-payment format rejection (e.g., Wi-Fi barcodes, HTTP URLs).
  10. High-value transaction threshold warning (₹50,000).

---

## Phase 6: Multilingual Voice Assistance (COMPLETED & VERIFIED)
- [x] Configured `i18next` with complete localization across 4 languages:
  1. English (`en`)
  2. Hindi (`hi` - हिंदी)
  3. Kannada (`kn` - ಕನ್ನಡ)
  4. Malayalam (`ml` - മലയാളം)
- [x] Built auditory text-to-speech engine (`services/voiceService.ts`) with `expo-speech` announcing payee name and amount in the user's active regional language.
- [x] Added on-demand "Hear Details Again" voice button.

---

## Phase 7: Simulated Payment System (COMPLETED & VERIFIED)
- [x] Built comprehensive Transaction Review screen (`app/transaction/review.tsx`) displaying Green/Yellow/Red indicators, risk breakdown, and explicit acknowledgement checkboxes.
- [x] Enforced hard blocks on Critical-Risk (🔴 RED) QR codes.
- [x] Built Transaction PIN verification screen (`app/transaction/pin.tsx`).
- [x] Implemented atomic SQLite balance deduction and transaction logging (`database/walletRepo.ts`).
- [x] Generated digital payment receipt stamped `"DEMO TRANSACTION – NO REAL MONEY TRANSFERRED"` (`app/transaction/receipt.tsx`).

---

## Phase 8: History & FAQ Assistant (COMPLETED & VERIFIED)
- [x] Built persistent transaction history log (`app/(tabs)/history.tsx`) with search, status filters (All, Success, Blocked), and detailed receipt modal.
- [x] Built interactive offline multilingual FAQ Assistant chatbot (`app/(tabs)/assistant.tsx`) answering key QR safety questions.
- [x] Built Settings & Security screen (`app/(tabs)/profile.tsx`) with dynamic language switcher, voice toggle, biometric toggle, high-value threshold configurator, and data reset.

---

## Phase 9: Automated Testing & Verification (COMPLETED & VERIFIED)
- [x] Automated test runner (`mobile/tests/fraudEngine.test.ts`):
  - 24 / 24 test cases passed (100% pass rate).
- [x] TypeScript verification:
  - `mobile/`: 0 compiler errors.
  - `backend/`: 0 compiler errors.
