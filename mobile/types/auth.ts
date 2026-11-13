export interface UserProfile {
  id: string;
  username: string;
  failedLoginAttempts: number;
  lockoutUntil: string | null;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLockedOut: boolean;
  lockoutSecondsRemaining: number;
  hasLoginPin: boolean;
  hasTxPin: boolean;
  biometricSupported: boolean;
  biometricEnrolled: boolean;
}

export interface PinValidationResult {
  valid: boolean;
  error?: string;
  attemptsRemaining?: number;
}
