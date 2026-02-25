# Styling Primitives Guidelines (Issue #31)

Use this guide when touching UI code to keep design decisions centralized.

Related token guide: `docs/design-token-usage.md`

## Decision Order

1. Use an existing primitive in `src/components/ui/*-primitives.ts(x)`
2. If no primitive exists, add/extend a primitive for repeated visual rules
3. Use local one-off classes only for truly page-specific styling

## Current Shared Primitives

- `src/components/ui/page-primitives.tsx`: page shell/card and page header content
- `src/components/ui/page-message-card.tsx`: standard message card with CTA
- `src/components/ui/flow-state-primitives.tsx`: blocked state wrappers
- `src/components/ui/form-primitives.ts`: form control/read-only/error/success/layout tokens
- `src/components/ui/dashboard-primitives.tsx`: dashboard stat layout and card styles
- `src/components/ui/nav-primitives.tsx`: nav structure and link styles

## Guardrails

- `npm run lint` includes `npm run lint:styles`
- `scripts/check-style-primitives.mjs` blocks reintroduction of known duplicated class strings
- Extend `forbiddenPatterns` when a new duplication hotspot is migrated to a primitive

## Pull Request Checklist for UI Changes

- Confirm changed UI files use shared primitives where available
- Confirm no duplicated class strings were introduced for migrated patterns
- Run `npm run lint` and ensure style guard passes
