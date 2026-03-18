"use client";

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface LoginFormPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit: (payload: LoginFormPayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const isDisabled = useMemo(() => isLoading, [isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setFieldError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setFieldError('Password is required.');
      return;
    }

    setFieldError(null);

    await onSubmit({
      email: normalizedEmail,
      password,
      rememberMe,
    });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="text-sm font-medium text-black">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-3 text-base text-black placeholder:text-[#4A4A4A] outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
          placeholder="you@company.com"
          disabled={isDisabled}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-sm font-medium text-black">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-3 pr-10 text-base text-black placeholder:text-[#4A4A4A] outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            placeholder="Your password"
            disabled={isDisabled}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#4A4A4A] hover:text-black"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isDisabled}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#4A4A4A]">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-[#E5E5E5] accent-black"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            disabled={isDisabled}
          />
          Remember me
        </label>
        <Link href="/auth/login" className="text-sm text-black underline underline-offset-2">
          Forgot password?
        </Link>
      </div>

      {(fieldError || error) && (
        <p className="rounded-lg border border-black bg-[#F5F5F5] px-3 py-2 text-sm text-black">
          {fieldError ?? error}
        </p>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {isLoading ? 'Sending OTP...' : 'Sign In'}
      </button>

      <button
        type="button"
        disabled
        className="h-11 rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm text-[#4A4A4A]"
      >
        Continue with Google
      </button>
    </form>
  );
}
