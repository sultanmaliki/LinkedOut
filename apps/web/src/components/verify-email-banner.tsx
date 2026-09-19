'use client';

import { useState } from 'react';
import { MailWarning, X } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export function VerifyEmailBanner() {
  const { user, accessToken } = useAuth();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  async function resend() {
    setStatus('sending');

    try {
      await apiFetch('/auth/resend-verification', { method: 'POST', token: accessToken });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="border-b border-line bg-gold-100 dark:bg-gold-600/10">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2.5">
        <MailWarning className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
        <p className="flex-1 text-[13px] text-fg-muted">
          Verify your email address to unlock posting, applying, and reviews.
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={status === 'sending'}
          className="shrink-0 text-[13px] font-medium text-fg hover:underline disabled:opacity-50"
        >
          {status === 'sending'
            ? 'Sending…'
            : status === 'sent'
              ? 'Sent — check your email'
              : 'Resend link'}
        </button>
        {status === 'error' && (
          <span className="shrink-0 text-[12px] text-rose-600 dark:text-rose-500">Failed</span>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1 text-fg-faint hover:text-fg"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
