'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { ModerationReason, ModerationTargetType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const REASONS: ModerationReason[] = [
  'SPAM',
  'HARASSMENT',
  'FAKE_PROFILE',
  'FAKE_REVIEW',
  'MISLEADING_JOB',
  'IMPERSONATION',
  'POLICY_VIOLATION',
  'OTHER',
];

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: ModerationTargetType;
  targetId: string;
}) {
  const { user, accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ModerationReason>('SPAM');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  if (!user) return null;

  async function submit() {
    setStatus('submitting');

    try {
      await apiFetch('/moderation/cases', {
        method: 'POST',
        token: accessToken,
        body: { targetType, targetId, reason, description: description.trim() || undefined },
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <span className="text-[12.5px] text-fg-faint">Reported — thanks for flagging this.</span>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[12.5px] font-medium text-fg-faint hover:text-fg"
      >
        <Flag className="h-3 w-3" /> Report
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-line-strong bg-canvas p-3">
      <Select value={reason} onChange={(e) => setReason(e.target.value as ModerationReason)}>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r.replace(/_/g, ' ')}
          </option>
        ))}
      </Select>
      <Textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Additional details (optional)"
        className="text-[13.5px]"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={submit}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit report'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
      {status === 'error' && (
        <p className="text-[12px] text-rose-600 dark:text-rose-500">Failed to submit report.</p>
      )}
    </div>
  );
}
