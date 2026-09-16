'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';
import type { AuditLogEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 30;

export function AuditLogPanel({ token }: { token: string }) {
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  function buildParams(offset: number) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (entityType.trim() && entityId.trim()) {
      params.set('entityType', entityType.trim());
      params.set('entityId', entityId.trim());
    }
    return params;
  }

  function load() {
    setIsLoading(true);
    apiFetch<AuditLogEntry[]>(`/moderation/audit-logs?${buildParams(0).toString()}`, { token })
      .then((list) => {
        setEntries(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .finally(() => setIsLoading(false));
  }

  function loadMore() {
    if (!entries) return;

    setLoadingMore(true);
    apiFetch<AuditLogEntry[]>(`/moderation/audit-logs?${buildParams(entries.length).toString()}`, {
      token,
    })
      .then((list) => {
        setEntries((prev) => [...(prev ?? []), ...list]);
        setHasMore(list.length === PAGE_SIZE);
      })
      .finally(() => setLoadingMore(false));
  }

  // Only mount and an actual token change should refetch — entityType/entityId
  // filters are applied explicitly via the Filter button, not on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [token]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="Entity type (e.g. moderation_case)"
          className="w-auto flex-1"
        />
        <Input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Entity ID"
          className="w-auto flex-1"
        />
        <Button type="button" variant="secondary" onClick={load}>
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      ) : !entries || entries.length === 0 ? (
        <Card>
          <CardBody className="pt-6 text-[14px] text-fg-muted">No audit log entries.</CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-line-strong p-3 text-[13.5px]">
              <p className="text-fg">
                <span className="font-medium">{entry.action}</span> on {entry.entityType} (
                {entry.entityId})
              </p>
              <p className="mt-1 text-[12px] text-fg-faint">
                actor {entry.actorId ?? 'system'} · {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
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
