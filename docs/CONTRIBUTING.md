# Contributing Guide

Welcome to the Hire Car engineering team. Follow these guidelines to maintain a clean, scalable, and secure codebase.

## Local Setup
See the `README.md` for standard local environment initialization.
Ensure you have `npm install` run and an `.env.local` populated.

## Branching & Commits
- Use descriptive branch names: `feature/vendor-analytics`, `bugfix/search-latency`, `chore/dependency-updates`.
- Use standard Conventional Commits:
  - `feat: added bulk vehicle upload`
  - `fix: resolved race condition in lead creation`
  - `docs: updated api routes`

## Development Workflow
1. **Never write raw SQL queries in the Next.js app.** Always use the Supabase ORM interface.
2. **Always validate input.** Every API route and Server Action must parse incoming data using `zod`.
3. **Handle loading states.** For any async action, utilize React `useTransition` or `useActionState` to provide immediate user feedback.

## Pre-Pull Request Checklist
Before opening a PR to `master`, you must run and pass the following locally:
```bash
npm run lint
npm run test
npm run build
```

**Zero Warnings Policy:**
The codebase has been strictly audited to have zero unused variables and zero unused imports. A PR that introduces ESLint warnings will fail in Vercel CI and will not be merged.

## Documentation Updates
If you add a new database table, update `docs/DATABASE.md`.
If you add a new public API endpoint, update `docs/API.md`.
If you change environment variables, update `.env.example`.
