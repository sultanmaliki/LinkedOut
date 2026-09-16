'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, Users } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import type { ProfessionalProfile } from '@/lib/types';
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

export default function ProfessionalsPage() {
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');
  const [activelyLooking, setActivelyLooking] = useState(false);
  const [profiles, setProfiles] = useState<ProfessionalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (headline.trim()) params.set('headline', headline.trim());
      if (location.trim()) params.set('location', location.trim());
      if (skill.trim()) params.set('skill', skill.trim());
      if (activelyLooking) params.set('activelyLooking', 'true');

      setIsLoading(true);
      apiFetch<ProfessionalProfile[]>(`/professionals?${params.toString()}`)
        .then(setProfiles)
        .catch(() => setProfiles([]))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [headline, location, skill, activelyLooking]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 max-w-xl">
        <h1 className="font-display text-[32px] font-medium tracking-[-0.01em] text-fg">
          Professionals
        </h1>
        <p className="mt-2 text-[15px] text-fg-muted">
          Browse professionals by headline, location, or skill.
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Headline, e.g. Staff Engineer"
        />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location, e.g. Austin"
        />
        <Input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Skill, e.g. Rust"
        />
      </div>

      <label className="mb-8 flex w-fit items-center gap-2 text-[13.5px] text-fg-muted">
        <input
          type="checkbox"
          checked={activelyLooking}
          onChange={(e) => setActivelyLooking(e.target.checked)}
          className="h-4 w-4 rounded border-line-strong accent-emerald-600"
        />
        Actively looking only
      </label>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          {headline || location || skill || activelyLooking ? (
            <>
              <Search className="h-8 w-8 text-fg-faint" strokeWidth={1.5} />
              <p className="text-[15px] font-medium text-fg">No matches</p>
              <p className="max-w-sm text-[14px] text-fg-muted">
                Try a different headline, location, or skill.
              </p>
            </>
          ) : (
            <>
              <Users className="h-8 w-8 text-fg-faint" strokeWidth={1.5} />
              <p className="text-[15px] font-medium text-fg">No professionals yet</p>
            </>
          )}
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Link key={profile.id} href={`/professionals/${profile.id}`}>
              <Card className="h-full p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-100 text-[14px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                  {initials(profile.fullName)}
                </div>

                <h2 className="mt-4 text-[16.5px] font-medium tracking-[-0.01em] text-fg">
                  {profile.fullName}
                </h2>

                {profile.headline && (
                  <p className="mt-1 text-[13.5px] text-fg-muted">{profile.headline}</p>
                )}

                {profile.currentLocation && (
                  <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] text-fg-faint">
                    <MapPin className="h-3 w-3" />
                    {profile.currentLocation}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
