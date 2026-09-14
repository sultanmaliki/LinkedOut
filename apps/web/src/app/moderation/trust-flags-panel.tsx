'use client';

import { useState, type FormEvent } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import type { TrustFlag } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';

export function TrustFlagsPanel({ token }: { token: string }) {
  const [userId, setUserId] = useState('');
  const [targetType, setTargetType] = useState('');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [scoreImpact, setScoreImpact] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lookupUserId, setLookupUserId] = useState('');
  const [flags, setFlags] = useState<TrustFlag[] | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  async function lookup(id: string) {
    if (!id.trim()) return;
    setIsLookingUp(true);

    try {
      const result = await apiFetch<TrustFlag[]>(`/moderation/trust-flags/user/${id.trim()}`, {
        token,
      });
      setFlags(result);
    } catch {
      setFlags([]);
    } finally {
      setIsLookingUp(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch('/moderation/trust-flags', {
        method: 'POST',
        token,
        body: {
          userId,
          targetType,
          targetId,
          reason,
          scoreImpact: scoreImpact ? Number(scoreImpact) : undefined,
        },
      });

      const submittedUserId = userId;
      setUserId('');
      setTargetType('');
      setTargetId('');
      setReason('');
      setScoreImpact('');

      if (lookupUserId.trim() === submittedUserId.trim()) {
        lookup(submittedUserId);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create trust flag');
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalScore = flags?.reduce((sum, f) => sum + f.scoreImpact, 0) ?? null;

  return (
    <div className="space-y-8">
      <Card>
        <CardBody className="pt-5">
          <h3 className="mb-4 text-[15px] font-medium text-fg">Flag a user</h3>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>User ID</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                placeholder="UUID"
              />
            </div>
            <div>
              <Label>Target type</Label>
              <Input
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                required
                placeholder="e.g. POST"
              />
            </div>
            <div>
              <Label>Target ID</Label>
              <Input
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                required
                placeholder="UUID"
              />
            </div>
            <div>
              <Label>Score impact (-100 to 100)</Label>
              <Input
                type="number"
                min={-100}
                max={100}
                value={scoreImpact}
                onChange={(e) => setScoreImpact(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Reason</Label>
              <Textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-[13px] text-rose-600 dark:text-rose-500 sm:col-span-2">{error}</p>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-fit sm:col-span-2">
              {isSubmitting ? 'Submitting…' : 'Add trust flag'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <h3 className="mb-4 text-[15px] font-medium text-fg">
            Look up a user&rsquo;s trust flags
          </h3>
          <div className="flex gap-2">
            <Input
              value={lookupUserId}
              onChange={(e) => setLookupUserId(e.target.value)}
              placeholder="User ID"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => lookup(lookupUserId)}
              disabled={isLookingUp}
            >
              {isLookingUp ? 'Looking up…' : 'Look up'}
            </Button>
          </div>

          {flags !== null && (
            <div className="mt-4 space-y-2">
              <p className="text-[13px] text-fg-muted">
                {flags.length} flag{flags.length === 1 ? '' : 's'}
                {totalScore !== null
                  ? ` · net score impact ${totalScore > 0 ? '+' : ''}${totalScore}`
                  : ''}
              </p>
              {flags.map((f) => (
                <div key={f.id} className="rounded-xl border border-line-strong p-3 text-[13.5px]">
                  <p className="text-fg">{f.reason}</p>
                  <p className="mt-1 text-[12px] text-fg-faint">
                    {f.targetType} · {f.targetId} · impact {f.scoreImpact} ·{' '}
                    {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
