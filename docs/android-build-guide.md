# QRaksha – Android Device Testing & APK Build Guide

This guide walks you through testing QRaksha on an actual physical Android smartphone and generating a standalone `.apk` file that can be installed on any Android device.

---

## Method 1: Instant Wireless Testing via Expo Go (Fastest & Recommended)

This method lets you test all features (camera scanner, voice alerts, dummy wallet, PIN authentication, SQLite database) instantly on your physical phone without compiling an APK.

### Step 1: Install Expo Go on your Phone
1. Open the **Google Play Store** on your Android smartphone.
2. Search for and install **Expo Go**.

### Step 2: Connect Phone and Computer to the Same Wi-Fi
- Ensure your Android phone and development PC are connected to the same Wi-Fi network or mobile hotspot.

### Step 3: Start the Mobile Client
1. Open PowerShell in the project directory:
   ```bash
   cd mobile
   npx expo start
   ```
2. A large QR code will appear in your terminal.
3. Open the **Expo Go** app on your Android phone and tap **"Scan QR code"**.
4. Point your phone at the terminal QR code. The app will bundle and open on your phone.

> **Tip for Wi-Fi Isolation issues:** If your college or router blocks local device connections, start Expo in tunnel mode:
> ```bash
> npx expo start --tunnel
> ```

---

## Method 2: Generate a Standalone Android APK via EAS Build

To install QRaksha as a real, permanent Android application (`.apk`) that doesn't need Expo Go or a computer connection, use Expo Application Services (EAS Build).

### Step 1: Install EAS CLI Globally
Run in terminal:
```bash
npm install -g eas-cli
```

### Step 2: Log into your Expo Account
If you don't have an Expo account, create a free one at [expo.dev](https://expo.dev/signup).
```bash
eas login
```

### Step 3: Run the Standalone APK Build Command
Navigate to the `mobile/` directory:
```bash
cd mobile
npm run build:apk
```
*(Or directly: `eas build -p android --profile preview`)*

### How it works:
- EAS reads the configured `mobile/eas.json` `preview` profile:
  ```json
  "preview": {
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    }
  }
  ```
- It compiles the native Android Gradle project in the cloud and produces a download link for `QRaksha.apk`.
- You will receive a direct QR code and download URL in your terminal.
- Open the link on your Android phone to download and install the APK!

---

## Method 3: Installing the `.apk` on your Android Device

When installing the APK directly on Android:
1. Tap the downloaded `QRaksha.apk` in your phone's notification panel or Files app.
2. If prompted: **"For your security, your phone is not allowed to install unknown apps from this source"**:
   - Tap **Settings**.
   - Toggle **"Allow from this source"** to ON.
   - Tap **Back** and tap **Install**.
3. Launch **QRaksha** from your app drawer!

---

## Physical Device Backend Networking Configuration

When testing backend services (`/api/auth/send-otp` or `/api/health`) from a physical Android phone:
- Android does **not** recognize `localhost` as your development computer (`localhost` on a phone refers to the phone itself).
- Find your computer's local Wi-Fi IP address in PowerShell:
  ```powershell
  ipconfig
  ```
  Look for **IPv4 Address** (e.g., `192.168.1.15`).
- In `c:\Users\sohap\College\Mini_Project\QRaksha\.env`:
  ```ini
  EXPO_PUBLIC_API_URL=http://192.168.1.15:5000
  ```
- QRaksha will automatically communicate with your laptop's backend over the shared Wi-Fi network.
