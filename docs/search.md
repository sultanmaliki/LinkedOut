# Search Architecture

> **Status: Deferred, not implemented.** Meilisearch runs in `docker-compose.yml` but has zero application code references. Professional search/discovery (`GET /professionals`) is implemented as direct PostgreSQL queries with filters, not a search index. This is a design sketch for a future scale-up, kept for reference — see [architecture.md](architecture.md).

## Goals

- Enable fast search over users, companies, reviews, and content
- Support relevance ranking with business-specific signals
- Keep search independent from transactional storage for performance and resilience

## Recommended Platform

- Meilisearch for full-text and typo-tolerant search
- Periodic indexing from PostgreSQL via background jobs
- Separate index pipelines for companies, reviews, and users

## Indexing Strategy

- Reindex on content changes or moderation state changes
- Maintain a small set of high-value searchable fields
- Store derived metadata like popularity, recency, and verified status

## Query Design

- Search by company name, industry, and review topics
- Filter by location, company size, salary range, and verification
- Rank by relevance, recency, and trust signals
