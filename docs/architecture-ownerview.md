# LiftIt Web Application – Architecture Overview

## Framework & Tooling

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui component system
- Separate repository from backend

## Design Requirements

- **Responsive Design**: All features must work on mobile phone browsers and desktop browsers (see [ADR-0001](adr/0001-responsive-design-mobile-and-desktop.md))
- Mobile-first approach using Tailwind breakpoints
- Minimum 44x44px touch targets for mobile interactions
- **Shared styling layer**: Look-and-feel is defined once via shared tokens/primitives, then reused across pages/components (see [ADR-0002](adr/0002-design-v1-direction-and-non-goals.md))

### Styling Governance

- Use semantic tokens and shared style primitives as the default for visual decisions
- Avoid duplicating hardcoded visual rules across page-level components
- Limit local one-off styles to genuinely unique UI needs
- Styling de-duplication work is tracked by epic `#32` with child issues `#28`, `#29`, `#30`, and `#31`
- Audit findings and migration priorities: `docs/styling-duplication-audit.md`
- Contributor guidance and guardrails: `docs/styling-primitives-guidelines.md`

### Shared Styling Primitives

Use these primitives before introducing new page-level classes:

- `src/components/ui/page-primitives.tsx` for `PageShell`, `PageCard`, `PageHeader`, and underlying page text primitives
- `src/components/ui/page-message-card.tsx` for blocked/unavailable/sign-in message cards with a CTA
- `src/components/ui/flow-state-primitives.tsx` for shared blocked-state wrappers
- `src/components/ui/form-primitives.ts` for repeated form control/read-only/error/success styles
- `src/components/ui/dashboard-primitives.tsx` for dashboard stats layout/cards
- `src/components/ui/nav-primitives.tsx` for shared app navigation chrome styles

Guardrail:

- Run `npm run lint:styles` (already included in `npm run lint`) to fail on known duplicated style class strings that should use shared primitives

---

## Authentication Flow

- Auth0 Hosted Universal Login
- Web app redirects to Auth0 for authentication
- Receives JWT via OIDC flow (authorization code + PKCE)
- Calls backend using Bearer token
- No authentication logic handled directly by backend; Java backend validates JWT signature against Auth0's JWKS endpoint

### Implementation

SDK: `@auth0/nextjs-auth0` (server-side, HttpOnly cookie session)

| File | Role |
|------|------|
| `src/lib/auth0.ts` | `Auth0Client` singleton — imported wherever auth is needed |
| `src/middleware.ts` | Intercepts all requests; mounts `/auth/login`, `/auth/logout`, `/auth/callback` routes automatically |
| `src/lib/auth/session.ts` | `getAccessToken()` — returns the JWT for the current request; use in Server Components, Route Handlers, and Server Actions |

### Auth0 Dashboard setup (per environment)

- Application type: **Regular Web Application**
- Allowed Callback URLs: `<APP_BASE_URL>/auth/callback`
- Allowed Logout URLs: `<APP_BASE_URL>`

### Required environment variables (`.env.local`)

| Variable | Description |
|----------|-------------|
| `AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `dev-xyz.us.auth0.com`) |
| `AUTH0_CLIENT_ID` | Application client ID from Auth0 Dashboard |
| `AUTH0_CLIENT_SECRET` | Application client secret from Auth0 Dashboard |
| `AUTH0_SECRET` | 32-byte hex secret for cookie encryption — generate with `openssl rand -hex 32` |
| `APP_BASE_URL` | Optional — inferred from request host at runtime if omitted |

### Login / logout links

Use `<a>` tags (not `<Link>`) to avoid client-side routing interference:

```tsx
<a href="/auth/login">Log in</a>
<a href="/auth/logout">Log out</a>
```

### Using the token in a Server Component or Route Handler

```ts
import { getAccessToken } from "@/lib/auth/session";
import { apiRequest } from "@/lib/api/client";

const token = await getAccessToken(); // null if not logged in
const data = await apiRequest("/workouts", { token });
```

### React / SDK version notes

- React was upgraded from `19.0.0` → `19.2.4` to satisfy `@auth0/nextjs-auth0` peer dep (`^19.2.1`)
- Pinned SDK version: `@auth0/nextjs-auth0@4.15.0` (v4.14.0+ tightened the React peer dep range)

---

## API Integration

- Consumes REST API from separate backend repository
- Base path: `/api/v1/...`
- Uses standard HTTP verbs
- OpenAPI contract defines API structure

### Implementation

| File | Role |
|------|------|
| `src/lib/api/client.ts` | `apiRequest()` function with type-safe error handling |
| `src/lib/api/errors.ts` | `ApiError` class with status code helpers |

### Required environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend service URL (e.g., `http://localhost:8080`) |
| `NEXT_PUBLIC_API_BASE_PATH` | API version path (defaults to `/api/v1`) |

### Example usage

```ts
import { getAccessToken } from "@/lib/auth/session";
import { apiRequest, ApiError } from "@/lib/api/client";

const token = await getAccessToken();

try {
  const workouts = await apiRequest<Workout[]>("/workouts", { token });
} catch (error) {
  if (error instanceof ApiError && error.isUnauthorized) {
    // Handle auth error
  }
}
```

---

## Engineering Philosophy

- YAGNI
- Clean, minimal UI components
- Avoid premature abstraction
- Clear separation between UI logic and API logic
- Consistent styling through Tailwind + shadcn/ui with shared tokens/primitives first
