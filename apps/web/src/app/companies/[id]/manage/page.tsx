'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';
import type { Company } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/card';
import { BenefitsTab } from './benefits-tab';
import { JobsTab } from './jobs-tab';
import { LocationsTab } from './locations-tab';
import { OverviewTab } from './overview-tab';
import { VerificationTab } from './verification-tab';

const tabs = ['Overview', 'Locations', 'Benefits', 'Verification', 'Jobs'] as const;
type Tab = (typeof tabs)[number];

export default function ManageCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    (async () => {
      try {
        const [companyData, myCompanies] = await Promise.all([
          apiFetch<Company>(`/companies/${id}`),
          apiFetch<Company[]>('/companies/mine', { token: accessToken }),
        ]);
        setCompany(companyData);
        setIsAdmin(myCompanies.some((c) => c.id === id));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load company');
      }
    })();
  }, [id, accessToken, isAuthLoading, router]);

  if (isAuthLoading || (!company && !error)) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  if (error || !company) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Card>
          <CardBody className="pt-6 text-[14.5px] text-fg-muted">{error}</CardBody>
        </Card>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Card>
          <CardBody className="flex flex-col items-center gap-3 pt-12 pb-12 text-center">
            <ShieldAlert className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
            <p className="text-[14.5px] text-fg-muted">
              You don&rsquo;t manage {company.displayName}.
            </p>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link
        href="/companies/mine"
        className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Your companies
      </Link>

      <h1 className="mb-6 font-display text-[24px] font-medium tracking-[-0.01em] text-fg">
        Manage {company.displayName}
      </h1>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative shrink-0 px-3.5 py-2.5 text-[14px] font-medium transition-colors',
              activeTab === tab ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="pt-6">
          {activeTab === 'Overview' && (
            <OverviewTab company={company} token={accessToken!} onSaved={setCompany} />
          )}
          {activeTab === 'Locations' && (
            <LocationsTab companyId={company.id} token={accessToken!} />
          )}
          {activeTab === 'Benefits' && <BenefitsTab companyId={company.id} token={accessToken!} />}
          {activeTab === 'Verification' && (
            <VerificationTab companyId={company.id} token={accessToken!} />
          )}
          {activeTab === 'Jobs' && <JobsTab companyId={company.id} token={accessToken!} />}
        </CardBody>
      </Card>
    </main>
  );
}
