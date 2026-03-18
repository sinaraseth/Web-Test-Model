"use client";

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmOtp, requestOtp } from '../services/auth.client.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useLoginController() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = useMemo(() => searchParams.get('from') ?? '/', [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = identifier.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await requestOtp({
      identifier: email,
      type: 'email',
      intent: 'login',
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Unable to send OTP right now.');
      return;
    }

    const verifyUrl = `/auth/verify?identifier=${encodeURIComponent(email)}&from=${encodeURIComponent(from)}&intent=login&sent=1`;
    router.push(verifyUrl);
  };

  return {
    identifier,
    setIdentifier,
    isSubmitting,
    error,
    handleSubmit,
  };
}

export function useRegisterController() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = useMemo(() => searchParams.get('from') ?? '/', [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = identifier.trim().toLowerCase();
    const normalizedFullName = fullName.trim();

    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await requestOtp({
      identifier: email,
      type: 'email',
      intent: 'register',
      fullName: normalizedFullName || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Unable to send OTP right now.');
      return;
    }

    const fullNameQuery = normalizedFullName
      ? `&fullName=${encodeURIComponent(normalizedFullName)}`
      : '';
    const verifyUrl = `/auth/verify?identifier=${encodeURIComponent(email)}&from=${encodeURIComponent(from)}&intent=register&sent=1${fullNameQuery}`;
    router.push(verifyUrl);
  };

  return {
    identifier,
    setIdentifier,
    fullName,
    setFullName,
    isSubmitting,
    error,
    handleSubmit,
  };
}

export function useVerifyController() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const identifier = useMemo(() => searchParams.get('identifier') ?? '', [searchParams]);
  const from = useMemo(() => searchParams.get('from') ?? '/', [searchParams]);
  const intent = useMemo(
    () => (searchParams.get('intent') === 'register' ? 'register' : 'login'),
    [searchParams]
  );
  const fullName = useMemo(() => searchParams.get('fullName') ?? '', [searchParams]);
  const isFirstSend = useMemo(() => searchParams.get('sent') === '1', [searchParams]);

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    isFirstSend
      ? intent === 'register'
        ? 'Registration OTP has been sent to your email.'
        : 'Login OTP has been sent to your email.'
      : null,
  );

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setCode(digitsOnly);
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!identifier) {
      setError('Missing email. Go back and request a new code.');
      return;
    }

    if (code.length !== 6) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setInfo(null);

    const result = await confirmOtp({
      identifier,
      code,
      intent,
      fullName: intent === 'register' ? fullName : undefined,
    });

    setIsVerifying(false);

    if (!result.success) {
      setError(result.error ?? 'OTP verification failed.');
      return;
    }

    router.replace(from);
  };

  const handleResend = async () => {
    if (!identifier) {
      setError('Missing email. Go back and request a new code.');
      return;
    }

    setIsResending(true);
    setError(null);
    setInfo(null);

    const result = await requestOtp({
      identifier,
      type: 'email',
      intent,
      fullName: intent === 'register' ? fullName : undefined,
    });

    setIsResending(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to resend code.');
      return;
    }

    setInfo('A new OTP code has been sent.');
  };

  return {
    identifier,
    intent,
    from,
    code,
    isVerifying,
    isResending,
    error,
    info,
    handleCodeChange,
    handleVerify,
    handleResend,
  };
}
