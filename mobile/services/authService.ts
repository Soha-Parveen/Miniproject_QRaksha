import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { sha256 } from './crypto';
import { PinValidationResult } from '../types';

const KEY_LOGIN_PIN = 'qraksha_login_pin_hash';
const KEY_TX_PIN = 'qraksha_tx_pin_hash';
const KEY_SALT = 'qraksha_salt';
const KEY_FAILED_ATTEMPTS = 'qraksha_failed_attempts';
const KEY_LOCKOUT_UNTIL = 'qraksha_lockout_until';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds lockout

const getOrCreateSalt = async (): Promise<string> => {
  let salt = await SecureStore.getItemAsync(KEY_SALT);
  if (!salt) {
    salt = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await SecureStore.setItemAsync(KEY_SALT, salt);
  }
  return salt;
};

export const hasLoginPinSet = async (): Promise<boolean> => {
  const hash = await SecureStore.getItemAsync(KEY_LOGIN_PIN);
  return !!hash;
};

export const hasTxPinSet = async (): Promise<boolean> => {
  const hash = await SecureStore.getItemAsync(KEY_TX_PIN);
  return !!hash;
};

export const setLoginPin = async (pin: string): Promise<boolean> => {
  if (!/^\d{4}$/.test(pin)) return false;
  const salt = await getOrCreateSalt();
  const hash = sha256(`${pin}:${salt}`);
  await SecureStore.setItemAsync(KEY_LOGIN_PIN, hash);
  // Reset failure count on pin change
  await SecureStore.deleteItemAsync(KEY_FAILED_ATTEMPTS);
  await SecureStore.deleteItemAsync(KEY_LOCKOUT_UNTIL);
  return true;
};

export const setTransactionPin = async (pin: string): Promise<boolean> => {
  if (!/^\d{4}$/.test(pin)) return false;
  const salt = await getOrCreateSalt();
  const hash = sha256(`${pin}:${salt}:tx`);
  await SecureStore.setItemAsync(KEY_TX_PIN, hash);
  return true;
};

export const getLockoutStatus = async (): Promise<{ isLocked: boolean; secondsRemaining: number }> => {
  const lockoutUntilStr = await SecureStore.getItemAsync(KEY_LOCKOUT_UNTIL);
  if (!lockoutUntilStr) return { isLocked: false, secondsRemaining: 0 };

  const lockoutUntil = parseInt(lockoutUntilStr, 10);
  const now = Date.now();

  if (now < lockoutUntil) {
    const secondsRemaining = Math.ceil((lockoutUntil - now) / 1000);
    return { isLocked: true, secondsRemaining };
  } else {
    // Lockout expired, clear it
    await SecureStore.deleteItemAsync(KEY_LOCKOUT_UNTIL);
    await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, '0');
    return { isLocked: false, secondsRemaining: 0 };
  }
};

export const verifyLoginPin = async (pin: string): Promise<PinValidationResult> => {
  const lockout = await getLockoutStatus();
  if (lockout.isLocked) {
    return {
      valid: false,
      error: `Application locked. Try again in ${lockout.secondsRemaining}s.`,
      attemptsRemaining: 0,
    };
  }

  const storedHash = await SecureStore.getItemAsync(KEY_LOGIN_PIN);
  if (!storedHash) {
    return { valid: false, error: 'No PIN set' };
  }

  const salt = await getOrCreateSalt();
  const inputHash = sha256(`${pin}:${salt}`);

  if (inputHash === storedHash) {
    // Reset failed attempts on success
    await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, '0');
    await SecureStore.deleteItemAsync(KEY_LOCKOUT_UNTIL);
    return { valid: true };
  } else {
    // Increment failed attempts
    const failedStr = await SecureStore.getItemAsync(KEY_FAILED_ATTEMPTS);
    const failedCount = (parseInt(failedStr || '0', 10) || 0) + 1;
    await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, failedCount.toString());

    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      await SecureStore.setItemAsync(KEY_LOCKOUT_UNTIL, lockoutUntil.toString());
      return {
        valid: false,
        error: 'Too many failed attempts. Temporary 30s lockout activated.',
        attemptsRemaining: 0,
      };
    }

    return {
      valid: false,
      error: 'Incorrect PIN',
      attemptsRemaining: MAX_FAILED_ATTEMPTS - failedCount,
    };
  }
};

export const verifyTransactionPin = async (pin: string): Promise<boolean> => {
  const storedHash = await SecureStore.getItemAsync(KEY_TX_PIN);
  if (!storedHash) return false;

  const salt = await getOrCreateSalt();
  const inputHash = sha256(`${pin}:${salt}:tx`);
  return inputHash === storedHash;
};

export const checkBiometricSupport = async (): Promise<{ hasHardware: boolean; isEnrolled: boolean }> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return { hasHardware, isEnrolled };
  } catch {
    return { hasHardware: false, isEnrolled: false };
  }
};

export const authenticateBiometrics = async (promptMessage: string = 'Authenticate for QRaksha'): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Enter PIN',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.warn('[AuthService] Biometrics failed:', error);
    return false;
  }
};
