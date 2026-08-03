# Branching and Commit Conventions

## Git Branching Strategy
- `main`: production-ready code
- `develop`: integration branch for ongoing work
- `feature/<short-name>`: new features
- `fix/<short-name>`: bug fixes and technical debt
- `hotfix/<short-name>`: urgent production fixes
- `chore/<short-name>`: tooling, docs, and maintenance

## Branch Rules
- Branches are created from the latest `develop` or `main` depending on release cadence.
- Merge to `develop` first for non-critical changes.
- Merge to `main` only after regression and release checks pass.

## Commit Message Convention
Use Conventional Commits:
- `feat: add company profile review workflow`
- `fix: correct auth refresh token rotation`
- `docs: add deployment runbook`
- `refactor: split review moderation service`
- `test: add integration tests for application flow`

## Pull Request Expectations
- Include summary, testing evidence, and rollout considerations
- Link to issue or milestone
- Keep changes scoped and reviewable
