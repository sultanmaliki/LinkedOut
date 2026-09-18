import { Header } from '@nestjs/common';

/**
 * Marks a public, unauthenticated GET route as safe to cache in the
 * requester's browser (and any CDN in front of the API) for a short window.
 * Short max-age keeps staleness bounded (e.g. a just-created company not
 * showing up in a listing for a few seconds); stale-while-revalidate lets a
 * cache keep serving instantly while it refetches in the background.
 *
 * Never apply this to a route whose response varies per user/auth state —
 * that would let one user's cached response leak to another.
 */
export function PublicCache(maxAgeSeconds = 30, staleWhileRevalidateSeconds = 120) {
  return Header(
    'Cache-Control',
    `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  );
}
