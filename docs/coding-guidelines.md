# Coding Guidelines

## General Principles
- Prefer explicit, typed code over implicit behavior.
- Keep modules small and cohesive.
- Favor composition over inheritance.
- Write code for readability first, optimization second.
- Avoid mixing domain logic with infrastructure concerns.

## TypeScript Conventions
- Use strict TypeScript configuration.
- Prefer interfaces for public contracts and types for local utility structures.
- Avoid `any` unless absolutely necessary and documented.
- Prefer discriminated unions for state models.

## Naming Conventions
- Files: kebab-case (`company-profile.service.ts`)
- Classes: PascalCase (`CompanyProfileService`)
- Functions and variables: camelCase (`getCompanyReviews`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_PAGINATION_LIMIT`)
- Environment variables: UPPER_SNAKE_CASE

## Testing Expectations
- Unit tests for domain logic
- Integration tests for API and persistence boundaries
- End-to-end tests for critical user journeys
- Prefer deterministic tests over fragile UI snapshot tests

## Code Review Expectations
- One reviewer for routine changes
- Two reviewers for security or high-risk changes
- All new public APIs require documentation and tests
