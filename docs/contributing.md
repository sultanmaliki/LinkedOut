# Contributing Guide

## Development Workflow

1. Branch from `developing` (the integration branch) for ongoing work, or `main` for a hotfix — see [branching-and-commits.md](branching-and-commits.md).
2. Create a feature branch with the naming convention `feature/<short-description>` or `fix/<short-description>`.
3. Write or update tests for behavior changes.
4. Run linting, type checks, and relevant tests before opening a PR.
5. Open a pull request against main and include a summary, testing evidence, and rollout considerations.

## Code Review Standards

- Keep changes focused and easy to reason about.
- Prefer small, reviewable pull requests.
- **Update the relevant markdown docs in the same change** whenever behavior, an endpoint, a schema column, or a security control changes — not as a follow-up. `PROJECT_STATUS.md` and `docs/security.md` in particular go stale fast and are treated as part of the change, not optional.
- Avoid merging high-risk changes without explicit sign-off.

## Local Development

- Install dependencies with pnpm.
- Start infrastructure with docker compose up -d.
- Run the web and API apps in development mode from their app folders.
