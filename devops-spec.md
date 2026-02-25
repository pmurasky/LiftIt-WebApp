# DevOps Spec (LiftIt-WebApp)

## Purpose

This file defines the concrete DevOps contract for LiftIt-WebApp.

- Global policy source: `engineering-standards/docs/DEVOPS_STANDARDS.md`
- Repository-local implementation details live here
- If this file conflicts with global standards, global standards win

## Repository Profile

- Repository type: Next.js web application
- Primary runtime: Node.js
- Primary framework: Next.js (App Router)
- CI platform: GitHub Actions

## Runtime and Build Toolchain

- Node.js: 22.x (CI baseline)
- npm: project lockfile-driven install via `npm ci`
- Next.js: `^15.5.12`
- React: `^19.2.4`
- TypeScript: `^5.8.3`

## Required CI Commands

Every required CI run executes these commands in order:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

Failure of any required command fails the workflow.

## Test Tiers

- Unit tests: Vitest (`npm test`)
- Coverage-gated unit tests: `npm run test:coverage`
- Integration tests: not currently defined as a separate automated tier
- End-to-end tests: not implemented yet (tracked in issue `#17`)

## Container and Artifact Contract

- Docker/container images: not currently used (`Dockerfile` not present)
- Artifact/image publishing: not currently used
- If containerization is introduced, add image build, scan, and publish rules here before rollout

## Environment Model

- Local development: developer machine with `.env.local`
- CI: ephemeral GitHub Actions runners
- Production: hosted deployment target (Vercel or equivalent), exact platform configuration to be finalized

## Security Controls

- No hardcoded secrets in repository or workflow files
- `.env.local` remains gitignored
- Secrets stored in GitHub repository/environment secrets when needed
- Third-party actions pinned to full commit SHAs in workflows
- Use least-privilege workflow permissions (`contents: read` minimum)
- Enable dependency review on pull requests
- Enable Dependabot for npm and GitHub Actions updates
- Enable secret scanning and push protection in repository settings

## Branch Protection Baseline

- Protect `main` with required passing CI checks
- Require pull requests for merges to `main`
- Disallow bypass of required checks except for repository admins when explicitly needed

## Change Log

- 2026-02-25: Initial LiftIt-WebApp repository DevOps spec
