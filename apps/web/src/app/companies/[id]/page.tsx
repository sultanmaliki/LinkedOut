import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import type { Company, CompanyBenefit, CompanyLocation, CompanyReply, Review } from '@/lib/types';
import { CompanyReplyPanel } from '@/components/company-reply-panel';
import { CopyLinkButton } from '@/components/copy-link-button';
import { ManageCompanyLink } from '@/components/manage-company-link';
import { ReportButton } from '@/components/report-button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

async function getCompany(id: string): Promise<Company | null> {
  try {
    return await apiFetch<Company>(`/companies/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function getBenefits(id: string): Promise<CompanyBenefit[]> {
  try {
    return await apiFetch<CompanyBenefit[]>(`/companies/${id}/benefits`);
  } catch {
    return [];
  }
}

async function getLocations(id: string): Promise<CompanyLocation[]> {
  try {
    return await apiFetch<CompanyLocation[]>(`/companies/${id}/locations`);
  } catch {
    return [];
  }
}

async function getReviews(id: string): Promise<Review[]> {
  try {
    return await apiFetch<Review[]>(`/companies/${id}/reviews`);
  } catch {
    return [];
  }
}

async function getReply(reviewId: string): Promise<CompanyReply | null> {
  try {
    return await apiFetch<CompanyReply | null>(`/reviews/${reviewId}/reply`);
  } catch {
    return null;
  }
}

function averageScore(review: Review): number | null {
  if (review.ratings.length === 0) return null;
  const total = review.ratings.reduce((sum, rating) => sum + rating.score, 0);
  return total / review.ratings.length;
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [company, benefits, locations, reviews] = await Promise.all([
    getCompany(id),
    getBenefits(id),
    getLocations(id),
    getReviews(id),
  ]);

  if (!company) {
    notFound();
  }

  const replies = await Promise.all(reviews.map((review) => getReply(review.id)));
  const replyByReviewId = new Map(reviews.map((review, i) => [review.id, replies[i] ?? null]));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/companies"
        className="mb-8 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All companies
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-[20px] font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
            {company.displayName
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase())
              .join('')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[26px] font-medium tracking-[-0.01em] text-fg">
                {company.displayName}
              </h1>
              {company.verified && (
                <Badge tone="emerald">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[14px] text-fg-muted">
              {company.industry ?? 'Industry not specified'}
              {company.foundedYear ? ` · Founded ${company.foundedYear}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{company.companyType}</Badge>
              {locations.map((location) => (
                <Badge key={location.id}>
                  <MapPin className="h-3 w-3" />
                  {location.isRemote
                    ? 'Remote'
                    : [location.city, location.country].filter(Boolean).join(', ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong px-4 py-2 text-[13.5px] font-medium text-fg-muted hover:border-ink-400 hover:text-fg"
            >
              <Globe className="h-3.5 w-3.5" /> Visit website
            </a>
          )}
          <ManageCompanyLink companyId={company.id} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <ReportButton targetType="COMPANY" targetId={company.id} />
        <CopyLinkButton path={`/companies/${company.id}`} />
      </div>

      {company.description && (
        <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-fg-muted">
          {company.description}
        </p>
      )}

      {benefits.length > 0 && (
        <div className="mt-8">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.04em] text-fg-faint">
            Benefits
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {benefits.map((benefit) => (
              <Badge key={benefit.id} tone="gold">
                {benefit.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-medium tracking-[-0.01em] text-fg">
            Reviews
          </h2>
          <span className="text-[13.5px] text-fg-muted">
            {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {reviews.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Building2 className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
            <p className="text-[14.5px] text-fg-muted">
              No reviews yet. Reviews require verified employment, so this section fills in as
              verified employees share their experience.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const avg = averageScore(review);
              return (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[16px] font-medium tracking-[-0.01em] text-fg">
                        {review.title}
                      </h3>
                      <p className="mt-1 text-[12.5px] text-fg-faint">
                        {new Date(review.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                        {review.anonymous ? ' · Anonymous verified employee' : ''}
                        {review.edited ? ' · Edited' : ''}
                      </p>
                    </div>
                    <Badge tone={review.recommended ? 'emerald' : 'rose'}>
                      {review.recommended ? (
                        <ThumbsUp className="h-3 w-3" />
                      ) : (
                        <ThumbsDown className="h-3 w-3" />
                      )}
                      {review.recommended ? 'Recommends' : 'Does not recommend'}
                    </Badge>
                  </div>

                  <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">
                    {review.review}
                  </p>

                  {review.ratings.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4">
                      {review.ratings.map((rating) => (
                        <div key={rating.category} className="flex items-center gap-2">
                          <span className="text-[12px] font-medium uppercase tracking-[0.03em] text-fg-faint">
                            {rating.category.replace(/_/g, ' ')}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-1.5 w-4 rounded-full ${
                                  i < rating.score ? 'bg-emerald-500' : 'bg-ink-200 dark:bg-ink-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      {avg !== null && (
                        <span className="ml-auto text-[13px] font-medium text-fg">
                          {avg.toFixed(1)} / 5
                        </span>
                      )}
                    </div>
                  )}

                  <CompanyReplyPanel
                    reviewId={review.id}
                    companyId={company.id}
                    companyName={company.displayName}
                    initialReply={replyByReviewId.get(review.id) ?? null}
                  />

                  <div className="mt-4 border-t border-line pt-3">
                    <ReportButton targetType="REVIEW" targetId={review.id} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
