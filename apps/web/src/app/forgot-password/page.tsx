'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, MailCheck } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus('submitting');

    try {
      // The API always responds the same way whether or not the email is
      // registered, so this can't be used to test which emails have
      // accounts -- the UI mirrors that by always landing on the same
      // "check your email" state.
      await apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
      setStatus('sent');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-[28px] font-medium tracking-[-0.01em] text-fg">
          Reset your password
        </h1>
        <p className="mt-2 text-[14.5px] text-fg-muted">
          Enter your email and we&rsquo;ll send you a link to reset it.
        </p>
      </div>

      <Card className="p-6">
        <CardBody className="p-0">
          {status === 'sent' ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <MailCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-[15px] font-medium text-fg">Check your email</h2>
                <p className="mt-1 text-[14px] text-fg-muted">
                  If an account exists for {email}, we&rsquo;ve sent a link to reset the password.
                </p>
              </div>
              <Link href="/auth" className="mt-2 text-[13.5px] font-medium text-fg hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-100 px-3.5 py-3 text-[13.5px] text-rose-600 dark:bg-rose-600/10 dark:text-rose-500">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Send reset link'}
              </Button>

              <p className="text-center text-[13.5px] text-fg-faint">
                <Link href="/auth" className="hover:text-fg-muted hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
