'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import type { ModerationCase, ModerationStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { CaseDetail } from './case-detail';

const STATUS_FILTERS: Array<ModerationStatus | 'ALL'> = [
  'ALL',
  'OPEN',
  'UNDER_REVIEW',
  'ACTION_TAKEN',
  'DISMISSED',
];

const statusTone: Record<ModerationStatus, 'neutral' | 'gold' | 'emerald'> = {
  OPEN: 'gold',
  UNDER_REVIEW: 'gold',
  ACTION_TAKEN: 'emerald',
  DISMISSED: 'neutral',
};

const PAGE_SIZE = 20;

export function CasesPanel({ token }: { token: string }) {
  const [cases, setCases] = useState<ModerationCase[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  function buildPath(offset: number) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });

    if (statusFilter !== 'ALL') {
      params.set('status', statusFilter);
    }

    return `/moderation/cases?${params.toString()}`;
  }

  useEffect(() => {
    setCases(null);

    apiFetch<ModerationCase[]>(buildPath(0), { token }).then((list) => {
      setCases(list);
      setHasMore(list.length === PAGE_SIZE);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  function loadMore() {
    if (!cases) return;

    setLoadingMore(true);
    apiFetch<ModerationCase[]>(buildPath(cases.length), { token })
      .then((list) => {
        setCases((prev) => [...(prev ?? []), ...list]);
        setHasMore(list.length === PAGE_SIZE);
      })
      .finally(() => setLoadingMore(false));
  }

  function updateCase(updated: ModerationCase) {
    setCases((prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? prev);
  }

  if (cases === null) {
    return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="space-y-4">
      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as ModerationStatus | 'ALL')}
        className="w-auto"
      >
        {STATUS_FILTERS.map((s) => (
          <option key={s} value={s}>
            {s === 'ALL' ? 'All statuses' : s.replace(/_/g, ' ')}
          </option>
        ))}
      </Select>

      {cases.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <ShieldAlert className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
          <p className="text-[14.5px] text-fg-muted">No cases match this filter.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c.id} className="p-5">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{c.targetType}</Badge>
                  <Badge tone="rose">{c.reason.replace(/_/g, ' ')}</Badge>
                  <Badge tone={statusTone[c.status]}>{c.status.replace(/_/g, ' ')}</Badge>
                  <span className="ml-auto text-[12px] text-fg-faint">
                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-fg-faint">Target ID: {c.targetId}</p>
              </button>

              {expandedId === c.id && (
                <CaseDetail moderationCase={c} token={token} onUpdated={updateCase} />
              )}
            </Card>
          ))}

          {hasMore && (
            <Button
              type="button"
              variant="secondary"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
