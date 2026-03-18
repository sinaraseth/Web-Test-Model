"use client";

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthContainer from '../../../components/auth-container';

export default function VerifyPage() {
  const searchParams = useSearchParams();

  const identifier = useMemo(() => searchParams.get('identifier') ?? '', [searchParams]);
  const fullName = useMemo(() => searchParams.get('fullName') ?? '', [searchParams]);
  const intent = useMemo(
    () => (searchParams.get('intent') === 'register' ? 'register' : 'login'),
    [searchParams]
  );

  return (
    <AuthContainer
      initialTab={intent}
      initialStep="otp"
      initialIdentifier={identifier}
      initialFullName={fullName}
    />
  );
}
