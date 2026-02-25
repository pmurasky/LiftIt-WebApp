# Styling Duplication Audit (Epic #32 / Issue #28)

## Hotspots and Migration Targets

| Priority | Location | Duplicate Pattern | Example | Target Abstraction |
|---|---|---|---|---|
| High | `app/page.tsx`, `app/dashboard/page.tsx`, `app/profile/page.tsx` | Repeated blocked flow wrapper | `PageShell spacing="roomy"` + `PageMessageCard` with retry CTA | `BlockedStateView` (`src/components/ui/flow-state-primitives.tsx`) |
| High | `app/dashboard/page.tsx`, `app/profile/page.tsx`, `app/onboarding/profile/page.tsx`, `src/components/ui/page-message-card.tsx` | Repeated page header stack | `PageEyebrow` + `PageTitle` + `PageDescription` sequence | `PageHeader` (`src/components/ui/page-primitives.tsx`) |
| High | `src/components/profile/profile-onboarding-form.tsx`, `src/components/profile/profile-edit-form.tsx` | Repeated form root spacing | `className="mt-8 grid gap-5"` | `formLayoutClass` (`src/components/ui/form-primitives.ts`) |
| High | `app/dashboard/page.tsx` (3 cards) and future dashboards | Repeated stat card container styles | `rounded-lg border bg-background/40 p-4` | `DashboardStatCard` (`src/components/ui/dashboard-primitives.tsx`) |
| Medium | `app/dashboard/page.tsx` and future profile overview sections | Repeated stat grid layout | `mt-8 grid gap-4 sm:grid-cols-3` | `DashboardStatGrid` (`src/components/ui/dashboard-primitives.tsx`) |
| Medium | `src/components/profile/profile-onboarding-form.tsx`, `src/components/profile/profile-edit-form.tsx` | Repeated labels/field wrappers | `grid gap-2`, `text-sm font-medium` | Keep local for now; evaluate dedicated field wrapper if third form appears |
| Medium | `src/components/profile/profile-onboarding-form.tsx`, `src/components/profile/profile-edit-form.tsx` | Repeated units preference read-only block | Label + `formReadonlyValueClass` + same value text | Keep local for now to avoid premature component abstraction |
| Medium | `src/components/profile/profile-onboarding-form.tsx`, `src/components/profile/profile-edit-form.tsx` | Repeated feet/inches height group | Two side-by-side inputs + hidden `heightCm` | Keep local for now; revisit if weight entry adopts same structure |
| Low | `app/profile/page.tsx` and future breadcrumb pages | Inline breadcrumb text/link patterns | Dashboard link + `/ Profile` | Keep local until a second breadcrumb path ships |
| Low | Across form views | Error/success message layout repetition | border+background+text alert styles | Already centralized via `formErrorMessageClass` / `formSuccessMessageClass` |

## Prioritized Migration Order

1. Blocked state wrappers and page headers (highest user-facing consistency impact)
2. Dashboard overview cards (high-visibility data presentation)
3. Shared form shell spacing (cross-form consistency)
4. Optional deeper form field abstractions after another form confirms reuse value
