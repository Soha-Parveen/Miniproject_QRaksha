import { ParsedUPIParams } from '../types';

/**
 * Parses raw QR string and extracts UPI payment parameters.
 * Treats all QR input as untrusted.
 */
export const parseUPIString = (rawText: string): ParsedUPIParams => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      rawText: '',
      isUpi: false,
    };
  }

  const trimmed = rawText.trim();

  // Check if string adheres to the standard UPI URI scheme
  const isUpiScheme = /^upi:\/\/pay(\?.*)?$/i.test(trimmed);

  if (!isUpiScheme) {
    return {
      rawText: trimmed,
      isUpi: false,
    };
  }

  try {
    const queryStringIndex = trimmed.indexOf('?');
    if (queryStringIndex === -1) {
      return {
        rawText: trimmed,
        isUpi: true,
      };
    }

    const queryString = trimmed.substring(queryStringIndex + 1);
    const searchParams = new URLSearchParams(queryString);

    const pa = searchParams.get('pa') ? decodeURIComponent(searchParams.get('pa')!).trim() : undefined;
    const pn = searchParams.get('pn') ? decodeURIComponent(searchParams.get('pn')!).trim() : undefined;
    const am = searchParams.get('am') ? decodeURIComponent(searchParams.get('am')!).trim() : undefined;
    const cu = searchParams.get('cu') ? decodeURIComponent(searchParams.get('cu')!).trim().toUpperCase() : 'INR';
    const tn = searchParams.get('tn') ? decodeURIComponent(searchParams.get('tn')!).trim() : undefined;
    const tr = searchParams.get('tr') ? decodeURIComponent(searchParams.get('tr')!).trim() : undefined;
    const mc = searchParams.get('mc') ? decodeURIComponent(searchParams.get('mc')!).trim() : undefined;
    const url = searchParams.get('url') ? decodeURIComponent(searchParams.get('url')!).trim() : undefined;

    return {
      rawText: trimmed,
      isUpi: true,
      pa,
      pn,
      am,
      cu,
      tn,
      tr,
      mc,
      url,
    };
  } catch {
    return {
      rawText: trimmed,
      isUpi: true,
    };
  }
};
