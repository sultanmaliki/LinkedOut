'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import type {
  ModerationAction,
  ModerationActionType,
  ModerationCase,
  ModerationStatus,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const STATUSES: ModerationStatus[] = ['OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'DISMISSED'];

const ACTIONS: ModerationActionType[] = [
  'NO_ACTION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_BANNED',
  'COMPANY_VERIFICATION_REVOKED',
];

export function CaseDetail({
  moderationCase,
  token,
  onUpdated,
}: {
  moderationCase: ModerationCase;
  token: string;
  onUpdated: (updated: ModerationCase) => void;
}) {
  const [actions, setActions] = useState<ModerationAction[] | null>(null);
  const [status, setStatus] = useState<ModerationStatus>(moderationCase.status);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [actionType, setActionType] = useState<ModerationActionType>('NO_ACTION');
  const [notes, setNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadActions() {
    apiFetch<ModerationAction[]>(`/moderation/cases/${moderationCase.id}/actions`, { token }).then(
      setActions,
    );
  }

  useEffect(() => {
    loadActions();
    setStatus(moderationCase.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moderationCase.id]);

  async function saveStatus() {
    setIsSavingStatus(true);
    setError(null);

    try {
      const updated = await apiFetch<ModerationCase>(
        `/moderation/cases/${moderationCase.id}/status`,
        { method: 'PATCH', token, body: { status } },
      );
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update status');
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function recordAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingAction(true);
    setError(null);

    try {
      await apiFetch(`/moderation/cases/${moderationCase.id}/actions`, {
        method: 'POST',
        token,
        body: { action: actionType, notes: notes.trim() || undefined },
      });
      setNotes('');
      loadActions();
      onUpdated({ ...moderationCase, status: 'ACTION_TAKEN' });
      setStatus('ACTION_TAKEN');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to record action');
    } finally {
      setIsSubmittingAction(false);
    }
  }

  return (
    <div className="mt-4 space-y-5 border-t border-line pt-4">
      {moderationCase.description && (
        <p className="text-[13.5px] text-fg-muted">{moderationCase.description}</p>
      )}

      <div>
        <p className="mb-1.5 text-[12px] font-medium uppercase tracking-[0.04em] text-fg-faint">
          Status
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as ModerationStatus)}
            className="w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={saveStatus}
            disabled={isSavingStatus || status === moderationCase.status}
          >
            {isSavingStatus ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[12px] font-medium uppercase tracking-[0.04em] text-fg-faint">
          Actions taken
        </p>
        {actions === null ? (
          <div className="h-6 animate-pulse rounded bg-canvas" />
        ) : actions.length === 0 ? (
          <p className="text-[13px] text-fg-faint">No actions recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a.id} className="text-[13.5px] text-fg-muted">
                <span className="font-medium text-fg">{a.action.replace(/_/g, ' ')}</span>
                {a.notes ? ` — ${a.notes}` : ''}
                <span className="ml-2 text-[12px] text-fg-faint">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={recordAction}
        className="space-y-2 rounded-xl border border-line-strong bg-canvas p-3"
      >
        <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-fg-faint">
          Record an action
        </p>
        <Select
          value={actionType}
          onChange={(e) => setActionType(e.target.value as ModerationActionType)}
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="text-[13.5px]"
        />
        <Button type="submit" size="sm" disabled={isSubmittingAction}>
          {isSubmittingAction ? 'Recording…' : 'Record action'}
        </Button>
      </form>

      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
    </div>
  );
}
