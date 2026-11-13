# QRaksha – System Architecture & Technical Design

## 1. High-Level Architecture Overview
QRaksha is structured with an **offline-first Android architecture**, powered by React Native and Expo, coupled with an auxiliary Node.js/Express backend service.

```
+---------------------------------------------------------------------------------+
|                                Android Device                                    |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |                       Presentation Layer (Expo Router)                    |  |
|  |   - Splash & Onboarding       - Dashboard & Wallet      - Review & Voice  |  |
|  |   - Auth & PIN Screens        - QR Scanner & Gallery    - FAQ Chatbot     |  |
|  +---------------------------------------------------------------------------+  |
|                                        |                                        |
|  +---------------------------------------------------------------------------+  |
|  |                         Core Application Services                         |  |
|  |   - UPI Parser Service           - Rule-based Fraud Detection Engine      |  |
|  |   - Multilingual Voice Engine    - Simulated Payment Processing Service   |  |
|  |   - Biometric & PIN Auth Manager - Contact Resolution Service             |  |
|  +---------------------------------------------------------------------------+  |
|                    |                                       |                    |
|  +----------------------------------+   +------------------------------------+  |
|  |    Local Secure Storage          |   |       Local SQLite Database        |  |
|  |   - expo-secure-store            |   |   - Users & Wallet Records         |  |
|  |   - Hashed PINs & Salt Tokens    |   |   - Atomic Transactions Log        |  |
|  |   - Security preferences         |   |   - Settings & Demo Contacts       |  |
|  +----------------------------------+   +------------------------------------+  |
+---------------------------------------------------------------------------------+
                                         | (Optional / Fallback)
                                         v
+---------------------------------------------------------------------------------+
|                        Auxiliary Backend (Node.js / Express)                    |
|   - Health & Telemetry          (/api/health)                                   |
|   - Server-Side QR Inspection   (/api/qr/decode-image)                          |
|   - Simulated / SMS OTP Service (/api/auth/send-otp, verify-otp)                |
+---------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### A. Mobile Client Layer (`mobile/`)
1. **Navigation (Expo Router v4):**
   - File-based routing with tab bar (Home, Scan, History, Assistant, Profile).
   - Modal flows for Authentication, Transaction Review, PIN Verification, and Receipts.
2. **Design System & UI Components:**
   - Unified color tokens: Primary Navy `#0A1E3F`, Emerald `#10B981`, Amber `#F59E0B`, Crimson `#EF4444`.
   - Card-based layouts using React Native Paper with proper touch targets and elevation.
3. **QR Parsing & Fraud Analysis Service:**
   - Validates URI structure (`upi://pay`).
   - Parses parameters: `pa` (VPA), `pn` (Name), `am` (Amount), `cu` (Currency), `tn` (Note), `tr` (Reference).
   - Performs heuristic checks for URL redirection, fake handles, character anomalies, and high amounts.
4. **Multilingual Speech Service (`expo-speech`):**
   - Synthesizes dynamic auditory feedback in English, Hindi, Kannada, and Malayalam.
   - Enforces user comprehension before critical transaction confirmation.
5. **Local SQLite Engine (`expo-sqlite`):**
   - Single-device persistent store.
   - Atomic transactions (`BEGIN TRANSACTION ... COMMIT`) to ensure dummy wallet integrity.

### B. Backend Layer (`backend/`)
- Lightweight REST service for auxiliary verification and development SMS OTP emulation.
- CORS restricted, Helmet secured, rate limited.
- Does not store client PINs or personal financial data.

---

## 3. Data Flow: Scan to Simulated Payment
```
[User Camera / Gallery]
       | (Image Stream / Frame)
       v
[expo-camera / expo-image-picker]
       | (Decoded String)
       v
[UPI Parser Service] ---> [Malformed / Non-UPI?] ---> [Red Flag / Warning]
       | (Valid Parameters)
       v
[Rule-based Fraud Detection Engine]
       |
       +---> Checks: VPA format, Payee name present, Amount threshold, Phishing rules
       v
[Safety Result] ---> Green (Safe) / Yellow (Caution) / Red (Critical Risk)
       |
       v
[Transaction Review Screen] <--- Displays details & safety explanation
       |
       v
[Voice Announcement] <--- expo-speech speaks in active language (EN/HI/KN/ML)
       |
       v
[Explicit User Confirmation Button]
       |
       v
[4-Digit Transaction PIN Entry] ---> Secure hash verification
       |
       v
[Atomic Wallet Deduction & Transaction Log in SQLite]
       |
       v
[Payment Success Screen & Digital Receipt ("DEMO")]
```

