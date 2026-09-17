'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useConfirmDialog } from '@/lib/use-confirm-dialog';
import type { PortfolioLink } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function PortfolioLinksSection({ token }: { token: string }) {
  const [links, setLinks] = useState<PortfolioLink[] | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { requestConfirm, dialog } = useConfirmDialog();

  function load() {
    apiFetch<PortfolioLink[]>('/professionals/me/portfolio-links', { token }).then(setLinks);
  }

  useEffect(load, [token]);

  async function remove(id: string) {
    await apiFetch(`/professionals/me/portfolio-links/${id}`, { method: 'DELETE', token });
    load();
  }

  function confirmRemove(link: PortfolioLink) {
    requestConfirm({
      title: 'Delete portfolio link?',
      description: `"${link.title}" will be removed from your profile.`,
      onConfirm: () => remove(link.id),
    });
  }

  return (
    <Card>
      <CardBody className="pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-medium text-fg">Portfolio links</h3>
            <p className="mt-0.5 text-[13px] text-fg-muted">
              GitHub, a website, case studies — whatever shows your work.
            </p>
          </div>
          {!isAdding && (
            <Button type="button" size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
              <Plus className="h-3.5 w-3.5" /> Add link
            </Button>
          )}
        </div>

        {isAdding && (
          <div className="mb-4">
            <LinkForm
              token={token}
              onCancel={() => setIsAdding(false)}
              onSaved={() => {
                setIsAdding(false);
                load();
              }}
            />
          </div>
        )}

        {links === null ? (
          <div className="h-12 animate-pulse rounded-xl bg-canvas" />
        ) : links.length === 0 && !isAdding ? (
          <p className="text-[13.5px] text-fg-faint">No portfolio links yet.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) =>
              editingId === link.id ? (
                <LinkForm
                  key={link.id}
                  token={token}
                  link={link}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => {
                    setEditingId(null);
                    load();
                  }}
                />
              ) : (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line-strong px-3.5 py-2.5"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-1.5 text-[13.5px] font-medium text-fg hover:text-emerald-600"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{link.title}</span>
                  </a>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(link.id)}
                      className="rounded-full p-1.5 text-fg-faint hover:text-fg"
                      aria-label={`Edit ${link.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmRemove(link)}
                      className="rounded-full p-1.5 text-fg-faint hover:text-rose-600"
                      aria-label={`Delete ${link.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardBody>
      {dialog}
    </Card>
  );
}

function LinkForm({
  token,
  link,
  onCancel,
  onSaved,
}: {
  token: string;
  link?: PortfolioLink;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(link?.title ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (link) {
        await apiFetch(`/professionals/me/portfolio-links/${link.id}`, {
          method: 'PATCH',
          token,
          body: { title, url },
        });
      } else {
        await apiFetch('/professionals/me/portfolio-links', {
          method: 'POST',
          token,
          body: { title, url },
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save link');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-start gap-2 rounded-xl border border-line-strong bg-canvas p-3"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title, e.g. GitHub"
        required
        className="flex-1"
      />
      <Input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://"
        required
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save'}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-3.5 w-3.5" />
      </Button>
      {error && <p className="w-full text-[12.5px] text-rose-600 dark:text-rose-500">{error}</p>}
    </form>
  );
}
