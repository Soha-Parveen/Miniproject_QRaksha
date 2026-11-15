const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BASE_URL}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    return data?.status === 'healthy';
  } catch {
    return false;
  }
};

export const requestRecoveryOtp = async (
  phoneNumber: string
): Promise<{ success: boolean; devOtp?: string; message?: string }> => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await res.json();
    return {
      success: data.success,
      devOtp: data.devOtp,
      message: data.message,
    };
  } catch (err: any) {
    // Graceful offline fallback
    return {
      success: false,
      message: 'Backend unavailable. Development offline mode active.',
    };
  }
};
