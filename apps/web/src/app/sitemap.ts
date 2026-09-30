import type { MetadataRoute } from 'next';

import { apiFetch } from '@/lib/api';
import type { Company, ProfessionalProfile } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Deterministic IDs the database seed script assigns (see SEED_IDS in
// packages/database/src/seed/index.ts) so dev/load-test data is recognizable
// and never mistaken for a real row. Keep them out of the public sitemap.
const SEED_ID_PREFIX = '00000000-0000-4000-8000-';
const isSeedId = (id: string) => id.startsWith(SEED_ID_PREFIX);

// The API caps `limit` at 100 per page, so a flat single fetch silently
// missed everything once there were more than 100 rows (it 400'd, and the
// catch below swallowed it). Page through instead so the sitemap keeps
// growing with the data. Capped at 20 pages (2000 rows) as a sanity limit
// in case the API ever stops honoring offset/limit correctly.
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const results: T[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const batch = await apiFetch<T[]>(`${path}?limit=${PAGE_SIZE}&offset=${offset}`);
    results.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  return results;
}

async function companyEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const companies = await fetchAllPages<Company>('/companies');
    return companies
      .filter((company) => !isSeedId(company.id))
      .map((company) => ({
        url: `${SITE_URL}/companies/${company.id}`,
        lastModified: company.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
  } catch {
    // The API being unreachable shouldn't take the whole sitemap down —
    // crawlers still get the static routes below.
    return [];
  }
}

async function professionalEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const profiles = await fetchAllPages<ProfessionalProfile>('/professionals');
    return profiles
      .filter((profile) => !isSeedId(profile.id))
      .map((profile) => ({
        url: `${SITE_URL}/professionals/${profile.id}`,
        lastModified: profile.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/companies`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/professionals`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/feed`, changeFrequency: 'hourly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const [companies, professionals] = await Promise.all([companyEntries(), professionalEntries()]);

  return [...staticRoutes, ...companies, ...professionals];
}
