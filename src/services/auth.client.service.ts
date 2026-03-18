import {
  OTPRequest,
  OTPVerifyRequest,
  SendOtpResponse,
  VerifyOtpResponse,
} from '../types/auth.types';

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  try {
    const parsed = await response.json();
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

export async function requestOtp(payload: OTPRequest): Promise<SendOtpResponse> {
  const response = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    return {
      success: false,
      error: readString(data.error, 'Failed to send OTP. Please try again.'),
    };
  }

  return {
    success: true,
    message: readString(data.message, 'OTP sent successfully.'),
  };
}

export async function confirmOtp(payload: OTPVerifyRequest): Promise<VerifyOtpResponse> {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    return {
      success: false,
      error: readString(data.error, 'Verification failed. Please try again.'),
    };
  }

  const user =
    typeof data.user === 'object' && data.user !== null
      ? (data.user as VerifyOtpResponse['user'])
      : undefined;

  return {
    success: true,
    user,
  };
}
