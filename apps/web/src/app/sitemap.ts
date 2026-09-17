import type { MetadataRoute } from 'next';

import { apiFetch } from '@/lib/api';
import type { Company, ProfessionalProfile } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

async function companyEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const companies = await apiFetch<Company[]>('/companies?limit=500');
    return companies.map((company) => ({
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
    const profiles = await apiFetch<ProfessionalProfile[]>('/professionals?limit=500');
    return profiles.map((profile) => ({
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
