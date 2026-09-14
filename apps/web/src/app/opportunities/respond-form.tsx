'use client';

import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { CONTACT_METHOD_TYPES, formatEnum } from '@/lib/enums';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface ContactMethodRow {
  type: (typeof CONTACT_METHOD_TYPES)[number];
  value: string;
}

export function RespondForm({
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
  const [mode, setMode] = useState<'accept' | 'decline'>('accept');
  const [message, setMessage] = useState('');
  const [contactMethods, setContactMethods] = useState<ContactMethodRow[]>([
    { type: 'EMAIL', value: '' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateRow(index: number, patch: Partial<ContactMethodRow>) {
    setContactMethods((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/professionals/me/opportunities/${opportunityId}/respond`, {
        method: 'POST',
        token,
        body: {
          accepted: mode === 'accept',
          message: message || undefined,
          contactMethods:
            mode === 'accept'
              ? contactMethods.filter((row) => row.value.trim().length > 0)
              : undefined,
        },
      });
      onResponded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send your response');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-line bg-canvas p-4">
      <div className="flex rounded-lg border border-line-strong bg-surface p-1">
        {(['accept', 'decline'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`flex-1 rounded-md py-1.5 text-[13px] font-medium transition-colors ${
              mode === tab
                ? tab === 'accept'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
                : 'text-fg-muted'
            }`}
          >
            {tab === 'accept' ? 'Accept' : 'Decline'}
          </button>
        ))}
      </div>

      {mode === 'accept' && (
        <div>
          <Label>Contact methods</Label>
          <p className="mb-2 text-[12px] text-fg-faint">
            Shared with the company only after you accept.
          </p>
          <div className="space-y-2">
            {contactMethods.map((row, index) => (
              <div key={index} className="flex gap-2">
                <Select
                  className="w-32 shrink-0"
                  value={row.type}
                  onChange={(e) =>
                    updateRow(index, { type: e.target.value as ContactMethodRow['type'] })
                  }
                >
                  {CONTACT_METHOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatEnum(type)}
                    </option>
                  ))}
                </Select>
                <Input
                  value={row.value}
                  onChange={(e) => updateRow(index, { value: e.target.value })}
                  placeholder={row.type === 'EMAIL' ? 'you@example.com' : 'Value'}
                />
                {contactMethods.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setContactMethods((rows) => rows.filter((_, i) => i !== index))}
                    className="shrink-0 rounded-lg p-2 text-fg-faint hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-600/10"
                    aria-label="Remove contact method"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setContactMethods((rows) => [...rows, { type: 'EMAIL', value: '' }])}
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <Plus className="h-3.5 w-3.5" /> Add another
          </button>
        </div>
      )}

      <div>
        <Label htmlFor={`message-${opportunityId}`}>Message (optional)</Label>
        <Textarea
          id={`message-${opportunityId}`}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting
            ? 'Sending…'
            : mode === 'accept'
              ? 'Accept opportunity'
              : 'Decline opportunity'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
