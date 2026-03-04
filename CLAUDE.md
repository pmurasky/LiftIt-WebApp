# LiftIt WebApp Agent Context

Use this file for LiftIt-specific context. For shared engineering standards and workflow rules, always apply `engineering-standards/CLAUDE.md`.

## Token Budget Mode

- Prefer targeted reads and searches (`Read` slices, scoped `Grep`/`Glob`) over broad scans.
- Use a compact task loop: investigate -> edit -> targeted verify -> report.
- Run the smallest useful verification first (single test/lint/typecheck for touched scope).
- Avoid dumping long command logs; summarize failures and key lines.
- If two correction attempts fail on the same issue, reset with a narrower prompt/context.
- Start a fresh session for unrelated tasks instead of carrying stale context.

## Project Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Auth0 (`@auth0/nextjs-auth0`)
- Vitest + Testing Library

## Common Commands

- `npm test`
- `npm run test:coverage`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Profile API Stub Behavior

- `PROFILE_API_STUB=true` is the default in development and test unless explicitly set to `false`.
- Real API mode requires backend profile endpoints to be available and reachable.

## Environment Variables

- API base is built from `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_BASE_PATH`.
- For environment variable details and architecture context, see `docs/architecture-ownerview.md`.

## Testing and Coverage

- Coverage thresholds are enforced in `vitest.config.ts`.
- Current thresholds: 80% across lines, functions, branches, and statements.

## ADRs

- Architecture decisions live in `docs/adr/`.

## Styling Guidance

- Reuse shared styling tokens/primitives to keep look-and-feel consistent across pages/components.
- Avoid duplicating page-level visual rules when shared styling primitives exist.
- Use `docs/styling-primitives-guidelines.md` for contributor guardrails.
- Use `docs/architecture-ownerview.md` for the shared primitive inventory.

## Out-of-Scope Files (Do Not Read)

Do not proactively read these — they are irrelevant to TypeScript/Next.js work or are stale historical snapshots:

- `engineering-standards/config/` — Java/Kotlin static analysis tool configs
- `engineering-standards/docs/GO_STANDARDS.md`
- `engineering-standards/docs/JAVA_STANDARDS.md`
- `engineering-standards/docs/KOTLIN_STANDARDS.md`
- `engineering-standards/docs/PYTHON_STANDARDS.md`
- `engineering-standards/docs/ARCHUNIT_STANDARDS.md`
- `engineering-standards/docs/CHECKSTYLE_STANDARDS.md`
- `engineering-standards/docs/SPOTBUGS_STANDARDS.md`
- `engineering-standards/docs/STATIC_ANALYSIS_STANDARDS.md`
- `engineering-standards/docs/SOLID_PRINCIPLES.md`
