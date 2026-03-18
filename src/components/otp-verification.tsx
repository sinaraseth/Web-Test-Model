"use client";

import { ClipboardEvent, KeyboardEvent, useMemo, useRef, useState } from 'react';
import { AuthIntent } from '../types/auth.types';

interface OTPVerificationProps {
  email: string;
  intent: AuthIntent;
  isLoading: boolean;
  isResending: boolean;
  error: string | null;
  info: string | null;
  timeRemaining: number;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

const OTP_LENGTH = 6;

export default function OTPVerification({
  email,
  intent,
  isLoading,
  isResending,
  error,
  info,
  timeRemaining,
  onVerify,
  onResend,
  onBack,
}: OTPVerificationProps) {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => digits.join(''), [digits]);
  const canResend = timeRemaining <= 0 && !isResending;

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = value;
    setDigits(nextDigits);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedDigits) {
      return;
    }

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] ?? '');
    setDigits(nextDigits);

    const focusIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    if (code.length !== OTP_LENGTH) {
      return;
    }

    await onVerify(code);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-black">Verify OTP</h2>
        <p className="text-sm text-[#4A4A4A]">
          Enter the 6-digit code sent to {email || 'your email'} to {intent === 'register' ? 'complete registration' : 'sign in'}.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={`otp-${index}`}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className="h-11 w-11 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] text-center text-lg font-semibold text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            aria-label={`OTP digit ${index + 1}`}
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-[#4A4A4A]">
        <span>{timeRemaining > 0 ? `Resend available in ${timeRemaining}s` : 'You can resend OTP now.'}</span>
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend}
          className="font-medium text-black underline underline-offset-2 disabled:text-[#4A4A4A]"
        >
          {isResending ? 'Resending...' : 'Resend OTP'}
        </button>
      </div>

      {info && <p className="rounded-lg border border-black bg-[#F5F5F5] px-3 py-2 text-sm text-black">{info}</p>}
      {error && <p className="rounded-lg border border-black bg-[#F5F5F5] px-3 py-2 text-sm text-black">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || code.length !== OTP_LENGTH}
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="h-11 rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm font-medium text-black"
      >
        Back
      </button>
    </div>
  );
}
