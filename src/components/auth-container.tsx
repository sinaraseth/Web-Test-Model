"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm, { LoginFormPayload } from './login-form';
import RegisterForm, { RegisterFormPayload } from './register-form';
import OTPVerification from './otp-verification';
import { confirmOtp, requestOtp } from '../services/auth.client.service';
import { AuthIntent } from '../types/auth.types';

type AuthTab = 'login' | 'register';
type AuthStep = 'form' | 'otp';

interface AuthContainerProps {
  initialTab?: AuthTab;
  initialStep?: AuthStep;
  initialIdentifier?: string;
  initialFullName?: string;
  onAuthSuccess?: () => void;
  logoSrc?: string;
}

export default function AuthContainer({
  initialTab = 'login',
  initialStep = 'form',
  initialIdentifier = '',
  initialFullName = '',
  onAuthSuccess,
  logoSrc = '/logo-ai.png',
}: AuthContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [step, setStep] = useState<AuthStep>(
    initialStep === 'otp' && initialIdentifier ? 'otp' : 'form'
  );

  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [fullName, setFullName] = useState(initialFullName);
  const [intent, setIntent] = useState<AuthIntent>(initialTab);

  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(step === 'otp' ? 60 : 0);

  const from = useMemo(() => searchParams.get('from') ?? '/', [searchParams]);

  useEffect(() => {
    if (step !== 'otp' || timeRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, timeRemaining]);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const openOtpStep = (nextIntent: AuthIntent, nextIdentifier: string, nextFullName = '') => {
    setIntent(nextIntent);
    setIdentifier(nextIdentifier);
    setFullName(nextFullName);
    setStep('otp');
    setTimeRemaining(60);
    setInfo(
      nextIntent === 'register'
        ? 'Registration OTP sent. Please check your email.'
        : 'Login OTP sent. Please check your email.'
    );
  };

  const handleLoginSubmit = async (payload: LoginFormPayload) => {
    setIsSending(true);
    resetMessages();

    const result = await requestOtp({
      identifier: payload.email,
      type: 'email',
      intent: 'login',
    });

    setIsSending(false);

    if (!result.success) {
      setError(result.error ?? 'Unable to send OTP.');
      return;
    }

    openOtpStep('login', payload.email);
  };

  const handleRegisterSubmit = async (payload: RegisterFormPayload) => {
    setIsSending(true);
    resetMessages();

    const result = await requestOtp({
      identifier: payload.email,
      type: 'email',
      intent: 'register',
      fullName: payload.fullName,
    });

    setIsSending(false);

    if (!result.success) {
      setError(result.error ?? 'Unable to send OTP.');
      return;
    }

    openOtpStep('register', payload.email, payload.fullName);
  };

  const handleVerify = async (code: string) => {
    setIsVerifying(true);
    resetMessages();

    const result = await confirmOtp({
      identifier,
      code,
      intent,
      fullName: intent === 'register' ? fullName : undefined,
    });

    setIsVerifying(false);

    if (!result.success) {
      setError(result.error ?? 'Verification failed.');
      return;
    }

    if (onAuthSuccess) {
      onAuthSuccess();
      return;
    }

    router.replace(from);
  };

  const handleResend = async () => {
    if (timeRemaining > 0) {
      return;
    }

    setIsResending(true);
    resetMessages();

    const result = await requestOtp({
      identifier,
      type: 'email',
      intent,
      fullName: intent === 'register' ? fullName : undefined,
    });

    setIsResending(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to resend OTP.');
      return;
    }

    setInfo('A new OTP has been sent.');
    setTimeRemaining(60);
  };

  const handleBack = () => {
    setStep('form');
    resetMessages();
  };

  const switchTab = (tab: AuthTab) => {
    if (step === 'otp') {
      return;
    }

    setActiveTab(tab);
    resetMessages();
  };

  return (
    <section className="min-h-screen bg-white px-4 py-8 text-black">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-lg border border-[#E5E5E5] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-3">
            <Image src={logoSrc} alt="Company logo" width={140} height={44} className="h-10 w-auto" />
            <p className="text-center text-sm text-[#4A4A4A]">Minimal and secure authentication</p>
          </div>

          <div className="mb-6 flex rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] p-1">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`h-11 flex-1 rounded-md text-sm font-medium transition ${
                activeTab === 'login' ? 'bg-white text-black shadow-sm' : 'text-[#4A4A4A]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`h-11 flex-1 rounded-md text-sm font-medium transition ${
                activeTab === 'register' ? 'bg-white text-black shadow-sm' : 'text-[#4A4A4A]'
              }`}
            >
              Register
            </button>
          </div>

          {step === 'otp' ? (
            <OTPVerification
              email={identifier}
              intent={intent}
              isLoading={isVerifying}
              isResending={isResending}
              error={error}
              info={info}
              timeRemaining={timeRemaining}
              onVerify={handleVerify}
              onResend={handleResend}
              onBack={handleBack}
            />
          ) : activeTab === 'login' ? (
            <LoginForm onSubmit={handleLoginSubmit} isLoading={isSending} error={error} />
          ) : (
            <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isSending} error={error} />
          )}
        </div>
      </div>
    </section>
  );
}
