# LiftIt WebApp Agent Context

Use this file for LiftIt-specific context. For shared engineering standards and workflow rules, always apply `engineering-standards/CLAUDE.md`.

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
- Current thresholds: 80% lines, 80% functions, 80% branches, 80% statements.

## ADRs

- Architecture decisions live in `docs/adr/`.

## Styling Decision

- Reuse shared styling tokens/primitives to keep look-and-feel consistent across pages/components.
- Avoid duplicating page-level visual rules when shared styling primitives exist.
- Track implementation in epic `#32` and issues `#28`, `#29`, `#30`, `#31`.
- See `docs/adr/0002-design-v1-direction-and-non-goals.md` for the accepted decision.
