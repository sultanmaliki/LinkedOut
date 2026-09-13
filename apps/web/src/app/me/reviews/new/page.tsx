'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatEnum, REVIEW_RATING_CATEGORIES } from '@/lib/enums';
import type { Company, EmploymentHistory, EmploymentVerification } from '@/lib/types';
import { ProfileNav } from '@/components/profile-nav';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { RatingInput } from '@/components/ui/rating-input';
import { Select } from '@/components/ui/select';

type VerifiedEntry = EmploymentHistory & { verification: EmploymentVerification };

export default function WriteReviewPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  const [verifiedEntries, setVerifiedEntries] = useState<VerifiedEntry[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdReviewCompanyId, setCreatedReviewCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    (async () => {
      try {
        const [history, companyList] = await Promise.all([
          apiFetch<EmploymentHistory[]>('/professionals/me/employment-history', {
            token: accessToken,
          }),
          apiFetch<Company[]>('/companies'),
        ]);

        const withVerification = await Promise.all(
          history.map(async (entry) => {
            try {
              const verification = await apiFetch<EmploymentVerification>(
                `/professionals/me/employment-history/${entry.id}/verification`,
                { token: accessToken },
              );
              return verification.verificationStatus === 'VERIFIED'
                ? { ...entry, verification }
                : null;
            } catch {
              return null;
            }
          }),
        );

        setVerifiedEntries(withVerification.filter((e): e is VerifiedEntry => e !== null));
        setCompanies(companyList);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load your data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [accessToken, isAuthLoading, router]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <ProfileNav />

      <h1 className="mb-1 font-display text-[22px] font-medium tracking-[-0.01em] text-fg">
        Write a review
      </h1>
      <p className="mb-6 text-[14px] text-fg-muted">
        Reviews are tied to a verified role, and companies can never delete or hide them.
      </p>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-surface" />
      ) : error ? (
        <Card>
          <CardBody className="pt-6 text-[14.5px] text-fg-muted">{error}</CardBody>
        </Card>
      ) : createdReviewCompanyId ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 pt-10 pb-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[15px] font-medium text-fg">Review published</p>
            <p className="max-w-sm text-[14px] text-fg-muted">
              Thanks for keeping the platform honest. Your review is now visible on the company
              profile.
            </p>
            <Link
              href={`/companies/${createdReviewCompanyId}`}
              className="mt-2 text-[13.5px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              View it on the company page →
            </Link>
          </CardBody>
        </Card>
      ) : verifiedEntries.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 pt-10 pb-10 text-center">
            <ShieldAlert className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
            <p className="text-[14.5px] text-fg-muted">
              You need at least one verified employment role before you can write a review.
            </p>
            <Link
              href="/me/employment"
              className="text-[13.5px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Add and verify a role →
            </Link>
          </CardBody>
        </Card>
      ) : (
        <ReviewForm
          token={accessToken!}
          entries={verifiedEntries}
          companies={companies}
          onCreated={(companyId) => setCreatedReviewCompanyId(companyId)}
        />
      )}
    </main>
  );
}

function ReviewForm({
  token,
  entries,
  companies,
  onCreated,
}: {
  token: string;
  entries: VerifiedEntry[];
  companies: Company[];
  onCreated: (companyId: string) => void;
}) {
  const [employmentHistoryId, setEmploymentHistoryId] = useState(entries[0]?.id ?? '');
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [recommended, setRecommended] = useState(true);
  const [anonymous, setAnonymous] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(REVIEW_RATING_CATEGORIES.map((c) => [c, 4])),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch('/reviews', {
        method: 'POST',
        token,
        body: {
          companyId,
          employmentHistoryId,
          title,
          review: reviewText,
          recommended,
          anonymous,
          ratings: REVIEW_RATING_CATEGORIES.map((category) => ({
            category,
            score: ratings[category],
          })),
        },
      });
      onCreated(companyId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish review');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="employmentHistoryId">Your verified role</Label>
              <Select
                id="employmentHistoryId"
                value={employmentHistoryId}
                onChange={(e) => setEmploymentHistoryId(e.target.value)}
              >
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.jobTitle} · {entry.companyName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="companyId">Company you&rsquo;re reviewing</Label>
              <Select
                id="companyId"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.displayName}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              minLength={4}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Great growth, tough on-call rotation"
            />
          </div>

          <div>
            <Label htmlFor="review">Your review</Label>
            <Textarea
              id="review"
              required
              minLength={20}
              rows={6}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What was it really like to work here?"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
            {REVIEW_RATING_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center justify-between gap-4">
                <span className="text-[13.5px] font-medium text-fg-muted">
                  {formatEnum(category)}
                </span>
                <RatingInput
                  value={ratings[category]}
                  onChange={(value) => setRatings((prev) => ({ ...prev, [category]: value }))}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-[13.5px] text-fg-muted">
              <input
                type="checkbox"
                checked={recommended}
                onChange={(e) => setRecommended(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-emerald-600"
              />
              I&rsquo;d recommend this employer
            </label>
            <label className="flex items-center gap-2 text-[13.5px] text-fg-muted">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-emerald-600"
              />
              Post anonymously
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-100 px-3.5 py-3 text-[13.5px] text-rose-600 dark:bg-rose-600/10 dark:text-rose-500">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing…' : 'Publish review'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
