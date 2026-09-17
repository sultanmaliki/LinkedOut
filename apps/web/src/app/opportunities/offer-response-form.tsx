'use client';

import { useState } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function OfferResponseForm({
  opportunityId,
  token,
  onResponded,
  onCancel,
}: {
  opportunityId: string;
  token: string;
  onResponded: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<'accept' | 'decline' | null>(null);

  async function respond(accepted: boolean) {
    setError(null);
    setIsSubmitting(accepted ? 'accept' : 'decline');

    try {
      await apiFetch(`/professionals/me/opportunities/${opportunityId}/respond-to-offer`, {
        method: 'POST',
        token,
        body: { accepted },
      });
      onResponded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send your response');
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
      <p className="text-[13.5px] text-fg-muted">
        Accepting locks in the offer and lets the company know you&rsquo;re moving forward.
        Declining closes this opportunity.
      </p>

      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" onClick={() => respond(true)} disabled={isSubmitting !== null}>
          {isSubmitting === 'accept' ? 'Accepting…' : 'Accept offer'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => respond(false)}
          disabled={isSubmitting !== null}
        >
          {isSubmitting === 'decline' ? 'Declining…' : 'Decline offer'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
