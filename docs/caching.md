# Caching Strategy

## Objectives
- Reduce repeated reads from PostgreSQL
- Improve latency for leaderboards, feed results, and company metadata
- Keep cache invalidation simple and predictable

## Cache Layers
- Browser caching for immutable frontend assets
- CDN or reverse proxy caching for public content
- Application-level caching with Valkey for hot read paths
- Search index layer for fast query results

## Recommended Cache Policies
- Company profile pages: 5 minutes
- Public list endpoints: 30 seconds
- Auth/session state: short TTL with rotation
- Search results: 60 seconds with stale-while-revalidate behavior

## Invalidation Strategy
- Invalidate on content mutation events
- Use event-driven invalidation for review changes and profile updates
- Prefer explicit cache keys over global purge where possible
