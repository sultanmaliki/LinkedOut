# Contributing Guide

## Development Workflow

1. Fork or branch from main.
2. Create a feature branch with the naming convention `feature/<short-description>` or `fix/<short-description>`.
3. Write or update tests for behavior changes.
4. Run linting, type checks, and relevant tests before opening a PR.
5. Open a pull request against main and include a summary, testing evidence, and rollout considerations.

## Code Review Standards

- Keep changes focused and easy to reason about.
- Prefer small, reviewable pull requests.
- Ensure documentation is updated when behavior or architecture changes.
- Avoid merging high-risk changes without explicit sign-off.

## Local Development

- Install dependencies with pnpm.
- Start infrastructure with docker compose up -d.
- Run the web and API apps in development mode from their app folders.
