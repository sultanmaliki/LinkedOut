# LinkedOut

LinkedOut is a parody-style professional networking platform where companies apply to employees rather than the reverse. The project is designed to help professionals evaluate employers through transparency, culture, compensation, interview experience, growth opportunities, and community feedback.

## Project Overview

This repository is a production-oriented monorepo for the LinkedOut platform. It currently includes:

- a Next.js web application for the user-facing experience,
- a NestJS backend for API and authentication flows,
- shared package-level utilities and types,
- documentation and engineering standards for scalable development,
- a Turbo-powered workspace setup for build, lint, and test orchestration.

The current repo state includes an initial authentication implementation for the backend and a basic auth UI entry point in the web app.

## Monorepo Structure

- apps/web: Next.js frontend application
- apps/api: NestJS backend service
- packages/ui: shared UI component package
- packages/config: shared tooling and configuration helpers
- packages/types: shared TypeScript types
- docs: architecture notes, roadmap items, ADRs, and operational documentation
- configs: repository-wide config helpers and shared linting setup

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript

### Backend

- NestJS
- TypeScript
- JWT-based authentication flow
- DTO validation and service-layer structure

### Tooling

- pnpm workspaces
- Turbo
- ESLint, Prettier, Husky, lint-staged
- Jest for backend tests

## Prerequisites

Make sure the following are installed before working locally:

- Node.js 20+ recommended
- pnpm
- Docker Desktop or a compatible Docker engine (for local services)

## Local Development Setup

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start supporting services (optional but recommended for full local development)

   ```bash
   docker compose up -d
   ```

3. Start the development workflow

   ```bash
   pnpm dev
   ```

   This runs the workspace development tasks through Turbo.

### Useful development commands

- Start the backend in watch mode:

  ```bash
  pnpm --filter @linkedout/api dev
  ```

- Start the web app locally:

  ```bash
  pnpm --filter @linkedout/web dev
  ```

- Build the entire monorepo:

  ```bash
  pnpm build
  ```

- Run tests across the workspace:

  ```bash
  pnpm test
  ```

## Available Scripts

From the repository root:

- pnpm build: builds all workspace packages
- pnpm lint: runs workspace lint tasks
- pnpm test: runs workspace tests
- pnpm typecheck: runs TypeScript type checks across the repo
- pnpm format: formats the repository with Prettier

### App-specific scripts

- apps/api
  - pnpm --filter @linkedout/api dev
  - pnpm --filter @linkedout/api build
  - pnpm --filter @linkedout/api test

- apps/web
  - pnpm --filter @linkedout/web dev
  - pnpm --filter @linkedout/web build
  - pnpm --filter @linkedout/web typecheck

## Current Development Status

The repository is currently in an early but structured production-ready foundation stage. The main areas already present include:

- monorepo scaffolding and workspace configuration,
- API and web application entry points,
- authentication module scaffolding,
- shared configuration and documentation conventions,
- build and test tooling.

## Contribution Guidelines

When contributing to this repository:

- keep app-specific logic inside the relevant app package,
- place reusable code in shared packages where appropriate,
- preserve the existing workspace conventions for TypeScript and tooling,
- update documentation when adding or changing major functionality.

## Architecture Principles

The project is intended to follow a modular, maintainable structure:

- keep app-specific concerns inside the relevant app package,
- place reusable logic in shared packages,
- keep documentation and platform decisions in the docs directory,
- prefer configuration consistency across the workspace.

## Documentation

Project documentation is organized in the docs directory and includes guidance on:

- architecture,
- authentication,
- deployment,
- feature planning,
- database and storage decisions,
- observability and operational practices.

## Recommended Next Steps

The next milestones for the project are:

- complete the core product domain modules,
- expand the authentication and authorization experience,
- wire the frontend and backend together more fully,
- strengthen CI/CD and production deployment workflows,
- add deeper observability and testing coverage.
