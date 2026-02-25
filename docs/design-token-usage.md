# Design Token Usage (Issue #13)

Use this guide when styling components so visual changes cascade from a single source of truth.

## Token Layers

- Primitive tokens are raw values in `app/globals.css` (for example `--primary`, `--success`, `--radius`).
- Semantic tokens are named roles exposed through Tailwind in `tailwind.config.ts` (for example `bg-primary`, `text-muted-foreground`, `border-destructive-border`).

## Decision Rule: Semantic vs Primitive

1. Use semantic token utilities in component classes by default.
2. Add or adjust primitive token values only when changing the visual system itself.
3. Do not hardcode color values in component classes when a semantic token exists.

## Common Mappings

- Page surface: `bg-background`, `text-foreground`, `border-border`
- Neutral helper text: `text-muted-foreground`
- Primary actions: `bg-primary`, `text-primary-foreground`
- Error states: `text-destructive`, `bg-destructive-soft`, `border-destructive-border`
- Success states: `text-success-foreground`, `bg-success-soft`, `border-success-border`

## Why This Matters

- Token updates cascade across pages without per-component edits.
- Visual states stay consistent between onboarding, profile, dashboard, and shared UI primitives.
- Styling review is simpler because intent is encoded in semantic token names.
