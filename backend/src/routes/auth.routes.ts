import { Router, Request, Response } from 'express';

const router = Router();

// In-memory store for dev OTPs (Key: phoneNumber, Value: { otp, expiresAt, requestId })
const devOtpStore = new Map<string, { otp: string; expiresAt: number; requestId: string }>();

/**
 * POST /api/auth/send-otp
 * Dispatches OTP for PIN recovery.
 * In development mode, logs OTP and returns it in a designated dev field.
 */
router.post('/send-otp', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10}$/.test(phoneNumber.trim())) {
    res.status(400).json({
      success: false,
      message: 'A valid 10-digit Indian mobile number is required.',
    });
    return;
  }

  const cleanPhone = phoneNumber.trim();
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const requestId = 'req_' + Math.random().toString(36).substring(2, 10);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  devOtpStore.set(cleanPhone, { otp, expiresAt, requestId });

  console.log(`[AUTH-DEV] ========================================`);
  console.log(`[AUTH-DEV] OTP for ${cleanPhone}: [ ${otp} ]`);
  console.log(`[AUTH-DEV] Request ID: ${requestId}`);
  console.log(`[AUTH-DEV] Expires at: ${new Date(expiresAt).toLocaleTimeString()}`);
  console.log(`[AUTH-DEV] ========================================`);

  res.status(200).json({
    success: true,
    message: 'OTP dispatched successfully (Development Mode).',
    requestId,
    devOtp: otp, // Development helper
    expiresInSeconds: 300,
  });
});

/**
 * POST /api/auth/verify-otp
 * Verifies OTP for PIN recovery.
 */
router.post('/verify-otp', (req: Request, res: Response) => {
  const { phoneNumber, otp, requestId } = req.body;

  if (!phoneNumber || !otp) {
    res.status(400).json({
      success: false,
      message: 'Mobile number and OTP are required.',
    });
    return;
  }

  const cleanPhone = phoneNumber.trim();
  const record = devOtpStore.get(cleanPhone);

  if (!record) {
    res.status(400).json({
      success: false,
      message: 'No OTP request found for this mobile number. Please request a new OTP.',
    });
    return;
  }

  if (Date.now() > record.expiresAt) {
    devOtpStore.delete(cleanPhone);
    res.status(400).json({
      success: false,
      message: 'The OTP has expired. Please request a new one.',
    });
    return;
  }

  if (record.otp !== otp.trim()) {
    res.status(400).json({
      success: false,
      message: 'Incorrect OTP. Please enter the valid code.',
    });
    return;
  }

  // Verified successfully - clean up
  devOtpStore.delete(cleanPhone);

  res.status(200).json({
    success: true,
    verified: true,
    message: 'OTP verified successfully.',
    resetSessionToken: 'rst_' + Buffer.from(`${cleanPhone}:${Date.now()}`).toString('base64'),
  });
});

export default router;

