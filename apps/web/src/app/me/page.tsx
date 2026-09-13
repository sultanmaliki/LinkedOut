'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, MapPin, Pencil } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { ProfessionalProfile } from '@/lib/types';
import { ProfileNav } from '@/components/profile-nav';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';

export default function MyProfilePage() {
  const router = useRouter();
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    apiFetch<ProfessionalProfile>('/professionals/me', { token: accessToken })
      .then(setProfile)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, [accessToken, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <ProfileNav />
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <ProfileNav />
        <Card>
          <CardBody className="pt-6 text-[14.5px] text-fg-muted">
            {error ?? 'Profile not found.'}
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <ProfileNav />
      {isEditing ? (
        <EditProfileForm
          profile={profile}
          token={accessToken!}
          onSaved={(updated) => {
            setProfile(updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <Card>
          <CardBody className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-ink-100 text-[20px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                  {profile.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join('')}
                </div>
                <div>
                  <h1 className="font-display text-[24px] font-medium tracking-[-0.01em] text-fg">
                    {profile.fullName}
                  </h1>
                  {profile.headline && (
                    <p className="mt-0.5 text-[14.5px] text-fg-muted">{profile.headline}</p>
                  )}
                  <p className="mt-1 text-[13px] text-fg-faint">{user?.email}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
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

            {profile.bio ? (
              <p className="mt-6 whitespace-pre-line text-[14.5px] leading-relaxed text-fg-muted">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-6 text-[14.5px] italic text-fg-faint">
                No bio yet — add one so companies know what you&rsquo;re about.
              </p>
            )}
          </CardBody>
        </Card>
      )}
    </main>
  );
}

function EditProfileForm({
  profile,
  token,
  onSaved,
  onCancel,
}: {
  profile: ProfessionalProfile;
  token: string;
  onSaved: (profile: ProfessionalProfile) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [headline, setHeadline] = useState(profile.headline ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [currentLocation, setCurrentLocation] = useState(profile.currentLocation ?? '');
  const [personalWebsite, setPersonalWebsite] = useState(profile.personalWebsite ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await apiFetch<ProfessionalProfile>('/professionals/me', {
        method: 'PATCH',
        token,
        body: {
          fullName,
          headline: headline || undefined,
          bio: bio || undefined,
          currentLocation: currentLocation || undefined,
          personalWebsite: personalWebsite || undefined,
        },
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-6">
        <h1 className="mb-6 font-display text-[22px] font-medium tracking-[-0.01em] text-fg">
          Edit profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Senior Software Engineer"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="Austin, TX"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={personalWebsite}
                onChange={(e) => setPersonalWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-100 px-3.5 py-3 text-[13.5px] text-rose-600 dark:bg-rose-600/10 dark:text-rose-500">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
