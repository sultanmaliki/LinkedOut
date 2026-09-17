import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Auth-gated: redirect to /auth client-side when signed out, so
        // crawlers would otherwise index an empty/redirect shell.
        '/me',
        '/me/*',
        '/opportunities',
        '/companies/mine',
        '/companies/new',
        '/companies/*/manage',
        // Role-gated (moderator/admin only).
        '/moderation',
        // Transactional: only meaningful with a one-time token in the
        // query string, nothing worth indexing without one.
        '/verify-email',
        // Query-dependent, duplicative of the professionals/companies
        // listing pages — also marked noindex on the page itself.
        '/search',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
