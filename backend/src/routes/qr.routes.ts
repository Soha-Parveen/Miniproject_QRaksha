import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/qr/inspect-text
 * Auxiliary endpoint to inspect raw text or URI parameters for testing.
 */
router.post('/inspect-text', (req: Request, res: Response) => {
  const { rawText } = req.body;

  if (!rawText || typeof rawText !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Raw QR text string is required.',
    });
    return;
  }

  const trimmed = rawText.trim();
  const isUpi = trimmed.startsWith('upi://pay');

  if (!isUpi) {
    res.status(200).json({
      success: true,
      isUpi: false,
      riskLevel: 'RED',
      reason: 'QR content does not follow standard UPI protocol (upi://pay)',
      rawText: trimmed,
    });
    return;
  }

  try {
    const url = new URL(trimmed);
    const params = {
      pa: url.searchParams.get('pa') || null,
      pn: url.searchParams.get('pn') || null,
      am: url.searchParams.get('am') || null,
      cu: url.searchParams.get('cu') || 'INR',
      tn: url.searchParams.get('tn') || null,
      tr: url.searchParams.get('tr') || null,
    };

    res.status(200).json({
      success: true,
      isUpi: true,
      params,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Malformed URI string.',
    });
  }
});

export default router;

