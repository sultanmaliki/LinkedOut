import Link from 'next/link';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import type { Company } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Companies — LinkedOut',
};

async function getCompanies(): Promise<Company[]> {
  try {
    return await apiFetch<Company[]>('/companies');
  } catch {
    return [];
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 max-w-xl">
        <h1 className="font-display text-[32px] font-medium tracking-[-0.01em] text-fg">
          Companies
        </h1>
        <p className="mt-2 text-[15px] text-fg-muted">
          Every profile here is built by the companies themselves. What professionals say about
          working there — reviews, compensation, culture — is what holds them accountable.
        </p>
      </div>

      {companies.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Building2 className="h-8 w-8 text-fg-faint" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-fg">No companies yet</p>
          <p className="max-w-sm text-[14px] text-fg-muted">
            Companies that join LinkedOut and build a profile will show up here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <Card className="h-full p-6 transition-shadow hover:shadow-[var(--shadow-lifted)]">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-[14px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                    {initials(company.displayName)}
                  </div>
                  {company.verified && (
                    <Badge tone="emerald">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>

                <h2 className="mt-4 text-[16.5px] font-medium tracking-[-0.01em] text-fg">
                  {company.displayName}
                </h2>

                {company.industry && (
                  <p className="mt-1 text-[13.5px] text-fg-muted">{company.industry}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge>{company.companyType}</Badge>
                  {company.employeeCount && (
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-fg-faint">
                      <MapPin className="h-3 w-3" />
                      {company.employeeCount.toLocaleString()} employees
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
