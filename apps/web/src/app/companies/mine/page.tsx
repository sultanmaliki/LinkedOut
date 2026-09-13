'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Plus, Settings, ShieldCheck } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Company } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export default function MyCompaniesPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    apiFetch<Company[]>('/companies/mine', { token: accessToken })
      .then(setCompanies)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load companies'))
      .finally(() => setIsLoading(false));
  }, [accessToken, isAuthLoading, router]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-medium tracking-[-0.01em] text-fg">
            For companies
          </h1>
          <p className="mt-1 text-[14.5px] text-fg-muted">
            Manage your company profile, post jobs, and reach professionals directly.
          </p>
        </div>
        <Link href="/companies/new" className={buttonStyles('primary', 'md')}>
          <Plus className="h-4 w-4" /> New company
        </Link>
      </div>

      {isAuthLoading || isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      ) : error ? (
        <Card>
          <CardBody className="pt-6 text-[14.5px] text-fg-muted">{error}</CardBody>
        </Card>
      ) : companies.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 pt-12 pb-12 text-center">
            <Building2 className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
            <p className="text-[14.5px] text-fg-muted">You don&rsquo;t manage any companies yet.</p>
            <Link
              href="/companies/new"
              className="text-[13.5px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Create your company profile →
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <Card key={company.id} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-[14px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                  {company.displayName
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join('')}
                </div>
                <div>
                  <p className="text-[15px] font-medium tracking-[-0.01em] text-fg">
                    {company.displayName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge>{company.companyType}</Badge>
                    {company.verified && (
                      <Badge tone="emerald">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Link
                href={`/companies/${company.id}/manage`}
                className={buttonStyles('secondary', 'sm')}
              >
                <Settings className="h-3.5 w-3.5" /> Manage
              </Link>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
