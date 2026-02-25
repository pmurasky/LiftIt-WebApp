# V1 Top-Flow Token Rollout Notes (Issue #14)

## Top Flows Covered

1. Unauthenticated entry and sign-in prompt (`app/page.tsx`)
2. Profile onboarding form (`app/onboarding/profile/page.tsx`, `src/components/profile/profile-onboarding-form.tsx`)
3. Profile review/edit flow (`app/profile/page.tsx`, `src/components/profile/profile-edit-form.tsx`)

## Before and After Notes

- Before: form validation relied on detached error text and did not consistently add invalid field semantics or error-state control styling.
- After: form inputs/selects in onboarding and edit flows now set `aria-invalid` and apply semantic destructive token classes on invalid fields.

- Before: control disabled treatment depended on browser defaults.
- After: shared form control primitive includes consistent disabled affordance using token-based opacity/cursor styles.

- Before: profile breadcrumb link used a local underline-only hover style.
- After: breadcrumb link uses semantic muted/foreground tokens plus focus ring state for keyboard visibility.

## State Normalization Applied

- Focus: ring state uses `ring-ring` by default and `ring-destructive` for invalid controls.
- Error: validation fields use `text-destructive`, `border-destructive-border`, and `bg-destructive-soft` semantics.
- Disabled: controls consistently use reduced opacity and disabled cursor styles via shared primitive.
- Hover: interactive link chrome on profile flow uses semantic hover contrast (`hover:text-foreground`).
