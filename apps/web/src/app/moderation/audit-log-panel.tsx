'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';
import type { AuditLogEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AuditLogPanel({ token }: { token: string }) {
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    const params = new URLSearchParams();
    if (entityType.trim() && entityId.trim()) {
      params.set('entityType', entityType.trim());
      params.set('entityId', entityId.trim());
    }

    setIsLoading(true);
    apiFetch<AuditLogEntry[]>(`/moderation/audit-logs?${params.toString()}`, { token })
      .then(setEntries)
      .finally(() => setIsLoading(false));
  }

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
        </div>
      )}
    </div>
  );
}
