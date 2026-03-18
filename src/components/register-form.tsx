"use client";

import { FormEvent, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface RegisterFormPayload {
  fullName: string;
  email: string;
  password: string;
}

interface RegisterFormProps {
  onSubmit: (payload: RegisterFormPayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password: string): { score: number; label: string } {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;

  if (score <= 1) return { score, label: 'Weak' };
  if (score === 2) return { score, label: 'Medium' };
  return { score, label: 'Strong' };
}

export default function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthWidthClass = useMemo(() => {
    if (strength.score <= 0) return 'w-0';
    if (strength.score === 1) return 'w-1/3';
    if (strength.score === 2) return 'w-2/3';
    return 'w-full';
  }, [strength.score]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setFieldError('Full name must be at least 2 characters.');
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setFieldError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setFieldError('Password must be at least 8 characters and include uppercase + number.');
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Confirm password does not match.');
      return;
    }

    if (!agreeTerms) {
      setFieldError('You must agree to the terms and conditions.');
      return;
    }

    setFieldError(null);

    await onSubmit({
      fullName: normalizedName,
      email: normalizedEmail,
      password,
    });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="register-name" className="text-sm font-medium text-black">
          Full Name
        </label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="h-11 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-3 text-base text-black placeholder:text-[#4A4A4A] outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
          placeholder="Your full name"
          disabled={isLoading}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-email" className="text-sm font-medium text-black">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-3 text-base text-black placeholder:text-[#4A4A4A] outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
          placeholder="you@company.com"
          disabled={isLoading}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-sm font-medium text-black">
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-3 pr-10 text-base text-black placeholder:text-[#4A4A4A] outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            placeholder="Create password"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#4A4A4A] hover:text-black"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded bg-[#E5E5E5]">
            <div className={`h-full bg-black transition-all ${strengthWidthClass}`} />
          </div>
          <span className="text-xs text-[#4A4A4A]">{strength.label}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-confirm-password" className="text-sm font-medium text-black">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-3 pr-10 text-base text-black placeholder:text-[#4A4A4A] outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            placeholder="Confirm password"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#4A4A4A] hover:text-black"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-[#4A4A4A]">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border border-[#E5E5E5] accent-black"
          checked={agreeTerms}
          onChange={(event) => setAgreeTerms(event.target.checked)}
          disabled={isLoading}
        />
        <span>I agree to the terms and conditions.</span>
      </label>

      {(fieldError || error) && (
        <p className="rounded-lg border border-black bg-[#F5F5F5] px-3 py-2 text-sm text-black">
          {fieldError ?? error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {isLoading ? 'Sending OTP...' : 'Sign Up'}
      </button>
    </form>
  );
}
