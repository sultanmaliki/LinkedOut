# Search Architecture

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
