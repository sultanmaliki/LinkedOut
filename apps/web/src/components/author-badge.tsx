'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { apiFetch } from '@/lib/api';
import type { Company, ProfessionalProfile } from '@/lib/types';
import { cn } from '@/lib/cn';

interface AuthorInfo {
  name: string;
  href: string;
  initials: string;
  sublabel?: string;
}

export function AuthorBadge({
  professionalProfileId,
  companyId,
  size = 'md',
}: {
  professionalProfileId: string | null;
  companyId: string | null;
  size?: 'sm' | 'md';
}) {
  const [author, setAuthor] = useState<AuthorInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (companyId) {
      apiFetch<Company>(`/companies/${companyId}`).then((company) => {
        if (cancelled) return;
        setAuthor({
          name: company.displayName,
          href: `/companies/${company.id}`,
          initials: initialsOf(company.displayName),
          sublabel: 'Company',
        });
      });
    } else if (professionalProfileId) {
      apiFetch<ProfessionalProfile>(`/professionals/${professionalProfileId}`).then((profile) => {
        if (cancelled) return;
        setAuthor({
          name: profile.fullName,
          href: `/professionals/${profile.id}`,
          initials: initialsOf(profile.fullName),
          sublabel: profile.headline ?? undefined,
        });
      });
    }

    return () => {
      cancelled = true;
    };
  }, [professionalProfileId, companyId]);

  const avatarSize = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-[13px]';

  if (!author) {
    return (
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'shrink-0 animate-pulse rounded-full bg-ink-100 dark:bg-ink-800',
            avatarSize,
          )}
        />
        <div className="h-3.5 w-24 animate-pulse rounded bg-ink-100 dark:bg-ink-800" />
      </div>
    );
  }

  return (
    <Link href={author.href} className="flex items-center gap-2.5">
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-ink-100 font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200',
          avatarSize,
        )}
      >
        {author.initials}
      </div>
      <div>
        <p className="text-[14px] font-medium leading-tight text-fg hover:underline">
          {author.name}
        </p>
        {author.sublabel && (
          <p className="text-[12px] leading-tight text-fg-faint">{author.sublabel}</p>
        )}
      </div>
    </Link>
  );
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}
