'use client';

import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import type { CompanyBenefit } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function BenefitsTab({ companyId, token }: { companyId: string; token: string }) {
  const [benefits, setBenefits] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch<CompanyBenefit[]>(`/companies/${companyId}/benefits`)
      .then((list) => setBenefits(list.map((b) => b.name)))
      .finally(() => setIsLoading(false));
  }, [companyId]);

  function addDraft() {
    const name = draft.trim();
    if (!name || benefits.includes(name)) return;
    setBenefits((prev) => [...prev, name]);
    setDraft('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addDraft();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await apiFetch(`/companies/${companyId}/benefits`, {
        method: 'PUT',
        token,
        body: { benefits },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save benefits');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-xl bg-canvas" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-[14px] text-fg-muted">
        Add benefits professionals will see on your profile. Press Enter to add each one.
      </p>

      <div className="flex flex-wrap gap-2 rounded-xl border border-line-strong bg-canvas p-3">
        {benefits.map((name) => (
          <Badge key={name} tone="gold" className="gap-1.5 py-1">
            {name}
            <button
              type="button"
              onClick={() => setBenefits((prev) => prev.filter((b) => b !== name))}
              className="rounded-full hover:text-rose-600"
              aria-label={`Remove ${name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addDraft}
          placeholder="Health insurance, remote work…"
          className="min-w-[160px] flex-1 border-none bg-transparent p-0 shadow-none focus:ring-0"
        />
      </div>

      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save benefits'}
      </Button>
    </form>
  );
}
