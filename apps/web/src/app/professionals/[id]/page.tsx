import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, MapPin } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import type { ProfessionalProfile } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/card';

async function getProfile(id: string): Promise<ProfessionalProfile | null> {
  try {
    return await apiFetch<ProfessionalProfile>(`/professionals/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/feed"
        className="mb-8 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
      </Link>

      <Card>
        <CardBody className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ink-100 text-[20px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
              {profile.fullName
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join('')}
            </div>
            <div>
              <h1 className="font-display text-[22px] font-medium tracking-[-0.01em] text-fg">
                {profile.fullName}
              </h1>
              {profile.headline && (
                <p className="mt-0.5 text-[14px] text-fg-muted">{profile.headline}</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-[13.5px] text-fg-muted">
            {profile.currentLocation && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {profile.currentLocation}
              </span>
            )}
            {profile.personalWebsite && (
              <a
                href={profile.personalWebsite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-fg"
              >
                <Globe className="h-3.5 w-3.5" />{' '}
                {profile.personalWebsite.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {profile.bio && (
            <p className="mt-6 whitespace-pre-line text-[14.5px] leading-relaxed text-fg-muted">
              {profile.bio}
            </p>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
