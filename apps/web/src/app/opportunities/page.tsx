'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Opportunity } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/card';
import { OpportunityCard } from './opportunity-card';

export default function OpportunitiesPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!accessToken) return;
    apiFetch<Opportunity[]>('/professionals/me/opportunities', { token: accessToken })
      .then((list) =>
        setOpportunities([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
      )
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load opportunities'),
      )
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    load();
  }, [accessToken, isAuthLoading, router, load]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8">
        <h1 className="font-display text-[26px] font-medium tracking-[-0.01em] text-fg">
          Opportunities
        </h1>
        <p className="mt-1 text-[14.5px] text-fg-muted">
          Companies that want to talk to you. Nothing is shared until you accept.
        </p>
      </div>

      {isAuthLoading || isLoading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-surface" />
      ) : error ? (
        <Card>
          <CardBody className="pt-6 text-[14.5px] text-fg-muted">{error}</CardBody>
        </Card>
      ) : opportunities.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 pt-12 pb-12 text-center">
            <Inbox className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
            <p className="text-[14.5px] text-fg-muted">No opportunities yet.</p>
            <p className="max-w-sm text-[13px] text-fg-faint">
              When a company sends you an opportunity, it&rsquo;ll show up here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              token={accessToken!}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </main>
  );
}
