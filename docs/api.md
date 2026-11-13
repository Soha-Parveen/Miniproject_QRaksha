# QRaksha – Auxiliary Backend API Specification

## 1. Base URL & Protocol
- **Base URL (Local Development):** `http://localhost:5000`
- **Mobile Target:** `http://<DEV_MACHINE_IP>:5000`
- **Format:** JSON (`application/json`)

---

## 2. Security & Policy
- **CORS:** Whitelisted to local development subnets and mobile scheme origins.
- **Rate Limiting:** Maximum 100 requests per 15 minutes per IP.
- **Headers:** Secured via `helmet`.

---

## 3. Endpoints

### A. Health Check
* **Route:** `GET /api/health`
* **Description:** Verifies service uptime and environment status.
* **Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "QRaksha-Backend",
  "version": "1.0.0",
  "timestamp": "2026-11-13T15:00:00.000Z"
}
```

### B. Request OTP (PIN Recovery)
* **Route:** `POST /api/auth/send-otp`
* **Description:** Initiates PIN reset by dispatching an OTP. In dev mode (`SMS_PROVIDER=DEV_MODE`), prints the OTP to backend logs and returns it in a designated dev field.
* **Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "requestId": "req_88f72a1e",
  "devOtp": "123456" // Only returned in development mode
}
```

### C. Verify OTP
* **Route:** `POST /api/auth/verify-otp`
* **Request Body:**
```json
{
  "phoneNumber": "9876543210",
  "requestId": "req_88f72a1e",
  "otp": "123456"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "verified": true,
  "resetToken": "jwt_token_for_pin_reset"
}
```

### D. Server-Side QR Image Inspection (Auxiliary)
* **Route:** `POST /api/qr/decode-image`
* **Description:** Fallback endpoint to decode difficult or corrupted QR image files.
* **Request:** `multipart/form-data` with `qrImage` file.
* **Response (200 OK):**
```json
{
  "success": true,
  "rawText": "upi://pay?pa=merchant@upi&pn=KiranaStore&am=150.00&cu=INR",
  "parsed": {
    "isUpi": true,
    "pa": "merchant@upi",
    "pn": "KiranaStore",
    "am": "150.00",
    "cu": "INR"
  }
}
```

