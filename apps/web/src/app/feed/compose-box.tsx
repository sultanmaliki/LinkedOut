'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function ComposeBox({ onPosted }: { onPosted: () => void }) {
  const { user, accessToken } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [asCompanyId, setAsCompanyId] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Company[]>('/companies/mine', { token: accessToken })
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, [accessToken]);

  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch('/posts', {
        method: 'POST',
        token: accessToken,
        body: { content, asCompanyId: asCompanyId || undefined },
      });
      setContent('');
      onPosted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardBody className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, a win, or something worth discussing…"
          />
          <div className="flex items-center justify-between gap-3">
            {companies.length > 0 ? (
              <Select
                className="w-auto"
                value={asCompanyId}
                onChange={(e) => setAsCompanyId(e.target.value)}
              >
                <option value="">Posting as {user.name}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    Posting as {company.displayName}
                  </option>
                ))}
              </Select>
            ) : (
              <span className="text-[13px] text-fg-faint">Posting as {user.name}</span>
            )}
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting…' : 'Post'}
            </Button>
          </div>
          {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
        </form>
      </CardBody>
    </Card>
  );
}
