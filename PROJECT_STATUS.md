# LinkedOut

## Current Version

v0.1.0-foundation

---

## Sprint 0 - Foundation

### Completed

- [x] Monorepo setup
- [x] Turborepo configuration
- [x] Next.js application
- [x] NestJS application
- [x] Docker Compose
- [x] PostgreSQL
- [x] Valkey
- [x] Meilisearch
- [x] MinIO
- [x] Documentation
- [x] ADRs
- [x] Development workflow

### Remaining

- [ ] Husky modernization
- [ ] ESLint integration
- [ ] Health checks for Docker services

---

## Sprint 1 - Domain Modeling & Database Design

### Completed

- [x] Master entity list and relationship matrix ([relationship-matrix.md](docs/architecture/relationship-matrix.md))
- [x] ER diagram ([er-diagram.md](docs/architecture/er-diagram.md))
- [x] Full database blueprint ([database-blueprint.md](docs/architecture/database-blueprint.md))
- [x] Schema freeze — 33 entities across Auth, Professional, Company, Publishing, Hiring, Reviews, Moderation ([schema-freeze.md](docs/architecture/schema-freeze.md))
- [x] Drizzle schema implementation for all frozen entities (`packages/database/src/schema`)

---

## Sprint 2 - Core API Modules (in progress)

### Completed

- [x] Auth module — register/login/refresh, DB-backed via Drizzle, unit + e2e tests
- [x] Professional profile module — controller/service/repository, update DTO, tests

### Remaining

- [ ] Company module (profile, locations, verification, admin claim flow)
- [ ] Reviews module (submission, ratings, company replies, snapshots)
- [ ] Hiring module (jobs, opportunities, hiring pipeline)
- [ ] Search indexing into Meilisearch
- [ ] Moderation module (reporting, moderation queue)
- [ ] Frontend pages beyond the single auth entry point

---

## Next Sprint

Sprint 3 - Companies domain (API + UI), followed by Reviews
