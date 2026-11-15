# QRaksha – Smart QR Payment Safety
> **Tagline:** Scan Smart. Pay Safe.  
> **Project Type:** Android-First Mobile Application & Verification Engine  
> **Target Audience:** Digital payment users, senior citizens, and consumers in India navigating UPI payments.

---

## 🛡️ Disclaimer
**Educational and Demonstration Purpose Only:**  
QRaksha is an educational and security demonstration application designed to protect users against fraudulent, malicious, or malformed payment QR codes. **This application does NOT execute real bank transfers or connect to real banking networks.** All wallet balances and transactions are completely simulated. Never enter your real banking passwords or actual bank UPI PINs into this or any unofficial application.

---

## 📌 Problem Statement & Overview
With the meteoric rise of UPI (Unified Payments Interface) in India, QR codes have become ubiquitous at merchant counters, street stalls, and digital invoices. However, malicious actors exploit this ubiquity through:
- **QR Sticker Tampering / Overlay Attacks:** Sticking fraudulent QR codes over genuine merchant codes.
- **Phishing & Deceptive URLs:** Embedding web links or malicious APK downloads disguised as payment prompts.
- **Parameter Manipulation & Ghost Amounts:** Tampering with payee names (`pn`), merchant categories, or pre-filling unexpected amounts.
- **Social Engineering & Panic Tactics:** Tricking rushed or non-tech-savvy users into paying without reviewing receiver details.

**QRaksha** bridges this security gap by acting as an intelligent pre-transaction safety guard. It scans, validates, explains risks using traffic-light indicators (Green, Yellow, Red), announces transaction details in regional languages, enforces explicit confirmation, and simulates payment execution safely.

---

## 🚀 Key Features

1. **Hardware Camera & Gallery QR Scanning:**
   - Real camera scanning via `expo-camera` with torch/flashlight support.
   - Image picker for scanning QR codes from saved gallery images or payment screenshots.

2. **Rule-Based QR Fraud Detection Engine:**
   - Complete UPI URI parser (`upi://pay?pa=...&pn=...&am=...&cu=...`).
   - Deep structural and syntax validation of VPA/UPI IDs, currency codes, and transaction notes.
   - Non-payment URL & deceptive schema detection.
   - Explainable risk indicators:
     - 🟢 **Green (Safe):** Well-formed UPI parameters, no suspicious indicators found.
     - 🟡 **Yellow (Caution):** Missing merchant name, unrecognized VPA handle format, unusual note.
     - 🔴 **Red (Critical Risk):** Malicious URL scheme, invalid characters, known phishing patterns, deceptive query params.
   - Configurable **High-Value Transaction Warning** (default threshold: ₹50,000).

3. **Multilingual Voice Assistance:**
   - Text-to-speech audio announcements powered by `expo-speech`.
   - Voice readouts of payee name, amount, and security status prior to payment.
   - 4 Supported Languages: **English**, **Hindi (हिंदी)**, **Kannada (ಕನ್ನಡ)**, and **Malayalam (മലയാളം)**.

4. **Two-Tier Authentication & Security:**
   - 4-digit **Login PIN** for application access with brute-force lockout prevention.
   - Independent 4-digit **Transaction PIN** required before any simulated payment.
   - Biometric authentication (Fingerprint / Face Unlock via `expo-local-authentication`).
   - Secure credential storage using `expo-secure-store` (never plaintext).

5. **Simulated Payment System & Dummy Wallet:**
   - Initial demo balance: **₹10,000**.
   - Atomic SQLite transactions for balance deduction and audit trails.
   - Realistic digital payment receipts stamped with `"DEMO TRANSACTION – NO REAL MONEY TRANSFERRED"`.

6. **Local SQLite Storage & Offline-First Design:**
   - Standalone offline capability for scanning, risk analysis, wallet deduction, and history viewing.
   - Complete transaction log with search, date filters, and status badges.

7. **Multilingual FAQ & Safety Assistant:**
   - Interactive in-app chatbot answering common QR security questions in all 4 supported languages.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile App** | React Native, Expo (SDK 52+), TypeScript, Expo Router |
| **UI Components** | React Native Paper, React Native Vector Icons, Reanimated, Gesture Handler |
| **Device Capabilities** | `expo-camera`, `expo-image-picker`, `expo-speech`, `expo-local-authentication`, `expo-secure-store`, `expo-haptics` |
| **Local Database** | SQLite (`expo-sqlite`) |
| **Localization** | `i18next`, `react-i18next` (English, Hindi, Kannada, Malayalam) |
| **Backend Service** | Node.js, Express.js, TypeScript, Helmet, CORS, Rate-Limiting |
| **Build & Deploy** | EAS Build (Android APK), Android Studio |

---

## 📁 Repository Structure

```
QRaksha/
├── mobile/                     # React Native Expo Mobile Client
│   ├── app/                    # Expo Router file-based routes
│   │   ├── (auth)/             # Login, Create PIN, Forgot PIN
│   │   ├── (tabs)/             # Bottom tabs: Home, Scan, History, Assistant, Profile
│   │   ├── transaction/        # Review, Voice Confirmation, PIN, Receipt
│   │   └── _layout.tsx         # Root layout & providers
│   ├── components/             # Reusable UI cards, buttons, modals, badges
│   ├── constants/              # Theme colors, security thresholds, typography
│   ├── database/               # SQLite migrations, queries, and repositories
│   ├── hooks/                  # Custom hooks (auth, wallet, speech, theme)
│   ├── locales/                # Translations (en, hi, kn, ml)
│   ├── services/               # Fraud detection engine, UPI parser, storage
│   └── types/                  # TypeScript interface definitions
│
├── backend/                    # Node.js Express API Service
│   ├── src/
│   │   ├── controllers/        # Request controllers
│   │   ├── middleware/         # Security & validation middleware
│   │   ├── routes/             # API routes (/api/health, /api/auth, /api/qr)
│   │   └── server.ts           # Express application entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Project Documentation
│   ├── architecture.md         # System architecture & data flow
│   ├── database.md             # SQLite schema design & integrity rules
│   ├── api.md                  # REST API contract & endpoints
│   ├── testing.md              # QA test matrix & execution log
│   └── development-log.md      # Phase-by-phase implementation record
│
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚙️ Getting Started & Installation

### Prerequisites
- **Node.js** v18+ or v20+ (Installed: `v24.14.0`)
- **npm** or **yarn**
- **Expo Go** app installed on your Android smartphone OR an Android Emulator.
- Git (`v2.47+`)

### 1. Clone the Repository
```bash
git clone https://github.com/Soha-Parveen/Miniproject_QRaksha.git
cd Miniproject_QRaksha
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend will launch on `http://localhost:5000`. Test the health check endpoint:
```bash
curl http://localhost:5000/api/health
```

### 3. Mobile App Setup
```bash
cd ../mobile
npm install
npx expo start
```
Scan the displayed QR code with the **Expo Go** app on your Android phone (ensure phone and PC are on the same Wi-Fi network).

### 4. Running Automated Tests
To run the automated 24-test QA fraud engine verification suite:
```bash
npm test
```

### 5. Building Standalone Android APK (.apk)
To generate an installable `.apk` for your physical Android device:
```bash
npm run build:apk
```
For detailed step-by-step instructions on sideloading and installing the APK, see the [Android Build Guide](docs/android-build-guide.md).

---

## 🛡️ Security Best Practices Enforced
- **Zero Plaintext Storage:** PINs are securely hashed with salts before storage.
- **Untrusted Input Sanitization:** All QR data is parsed through strict sanitization pipelines; URLs are never opened automatically.
- **Principle of Least Privilege:** Camera, gallery, and biometric permissions are requested on-demand only when initiating the respective action.
- **Isolated Demo Wallet:** Dummy balance is maintained solely in the local SQLite database and disconnected from external financial networks.

---

## 📜 License & Acknowledgements
Developed as a Computer Science & Engineering Mini-Project by **Soha Parveen**.  
Designed with guidance and best practices for fintech security and digital literacy in India.

