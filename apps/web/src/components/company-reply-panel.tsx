'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { MessageSquareReply, Pencil } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Company, CompanyReply } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';

export function CompanyReplyPanel({
  reviewId,
  companyId,
  companyName,
  initialReply,
}: {
  reviewId: string;
  companyId: string;
  companyName: string;
  initialReply: CompanyReply | null;
}) {
  const { accessToken, isLoading: isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [reply, setReply] = useState(initialReply);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialReply?.reply ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthLoading || !accessToken) return;

    apiFetch<Company[]>('/companies/mine', { token: accessToken })
      .then((companies) => setIsAdmin(companies.some((c) => c.id === companyId)))
      .catch(() => setIsAdmin(false));
  }, [accessToken, isAuthLoading, companyId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const saved = await apiFetch<CompanyReply>(`/reviews/${reviewId}/reply`, {
        method: reply ? 'PUT' : 'POST',
        token: accessToken,
        body: { reply: draft },
      });
      setReply(saved);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save reply');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!reply && !isAdmin) return null;

  return (
    <div className="mt-4">
      {reply && !isEditing && (
        <div className="rounded-xl border border-line-strong bg-canvas p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12.5px] font-medium text-fg-muted">
              Response from {companyName}
              {reply.edited ? ' · edited' : ''}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setDraft(reply.reply);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-fg-faint hover:text-fg"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
            )}
          </div>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-fg">
            {reply.reply}
          </p>
        </div>
      )}

      {!reply && isAdmin && !isEditing && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-fg-faint hover:text-fg"
        >
          <MessageSquareReply className="h-3.5 w-3.5" /> Reply as {companyName}
        </button>
      )}

      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="space-y-2 rounded-xl border border-line-strong bg-canvas p-3"
        >
          <Textarea
            rows={3}
            required
            minLength={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Reply as ${companyName}…`}
            className="text-[13.5px]"
          />
          {error && <p className="text-[12px] text-rose-600 dark:text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : reply ? 'Save' : 'Post reply'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
