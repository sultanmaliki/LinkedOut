'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Search, ShieldCheck, Users } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import type { Company, ProfessionalProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[] | null>(null);
  const [companies, setCompanies] = useState<Company[] | null>(null);

  useEffect(() => {
    const term = initialQuery.trim();

    if (!term) {
      setProfessionals([]);
      setCompanies([]);
      return;
    }

    setProfessionals(null);
    setCompanies(null);

    apiFetch<ProfessionalProfile[]>(`/professionals?q=${encodeURIComponent(term)}`)
      .then(setProfessionals)
      .catch(() => setProfessionals([]));

    apiFetch<Company[]>(`/companies?q=${encodeURIComponent(term)}`)
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, [initialQuery]);

  const isLoading = professionals === null || companies === null;
  const totalResults = (professionals?.length ?? 0) + (companies?.length ?? 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 max-w-xl">
        <h1 className="font-display text-[32px] font-medium tracking-[-0.01em] text-fg">Search</h1>
        <p className="mt-2 text-[15px] text-fg-muted">
          Searches professionals by name or headline, and companies by name.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
        }}
        className="mb-10 max-w-md"
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search professionals, companies…"
        />
      </form>

      {!initialQuery.trim() ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Search className="h-8 w-8 text-fg-faint" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-fg">Search LinkedOut</p>
          <p className="max-w-sm text-[14px] text-fg-muted">Try a name, headline, or company.</p>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : totalResults === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Search className="h-8 w-8 text-fg-faint" strokeWidth={1.5} />
          <p className="text-[15px] font-medium text-fg">
            No results for &ldquo;{initialQuery}&rdquo;
          </p>
          <p className="max-w-sm text-[14px] text-fg-muted">Try a different search term.</p>
        </Card>
      ) : (
        <div className="space-y-12">
          {professionals && professionals.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-medium text-fg">
                <Users className="h-4 w-4 text-fg-faint" />
                Professionals
                <span className="text-fg-faint">({professionals.length})</span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {professionals.map((profile) => (
                  <Link key={profile.id} href={`/professionals/${profile.id}`}>
                    <Card className="h-full p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong">
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-100 text-[14px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                        {initials(profile.fullName)}
                      </div>
                      <h3 className="mt-4 text-[16.5px] font-medium tracking-[-0.01em] text-fg">
                        {profile.fullName}
                      </h3>
                      {profile.headline && (
                        <p className="mt-1 text-[13.5px] text-fg-muted">{profile.headline}</p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {companies && companies.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-[15px] font-medium text-fg">
                <Building2 className="h-4 w-4 text-fg-faint" />
                Companies
                <span className="text-fg-faint">({companies.length})</span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((company) => (
                  <Link key={company.id} href={`/companies/${company.id}`}>
                    <Card className="h-full p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-100 text-[14px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                          {initials(company.displayName)}
                        </div>
                        {company.verified && (
                          <Badge tone="emerald">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-4 text-[16.5px] font-medium tracking-[-0.01em] text-fg">
                        {company.displayName}
                      </h3>
                      {company.industry && (
                        <p className="mt-1 text-[13.5px] text-fg-muted">{company.industry}</p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
