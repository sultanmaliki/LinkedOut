'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { buttonStyles } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { markEmailVerified } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('This verification link is missing a token.');
      return;
    }

    apiFetch('/auth/verify-email', { method: 'POST', body: { token } })
      .then(() => {
        markEmailVerified();
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setError(err instanceof ApiError ? err.message : 'Failed to verify your email.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <Card className="w-full">
        <CardBody className="flex flex-col items-center gap-4 pt-10 pb-10">
          {status === 'verifying' && (
            <>
              <div className="h-8 w-8 animate-pulse rounded-full bg-ink-200 dark:bg-ink-700" />
              <p className="text-[14.5px] text-fg-muted">Verifying your email…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-[16px] font-medium text-fg">Email verified</p>
                <p className="mt-1 text-[14px] text-fg-muted">
                  Your email address has been confirmed.
                </p>
              </div>
              <Link href="/feed" className={buttonStyles('primary', 'sm')}>
                Go to feed
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-500" />
              <div>
                <p className="text-[16px] font-medium text-fg">Verification failed</p>
                <p className="mt-1 text-[14px] text-fg-muted">{error}</p>
              </div>
              <Link href="/me" className={buttonStyles('secondary', 'sm')}>
                Back to profile
              </Link>
            </>
          )}
        </CardBody>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
