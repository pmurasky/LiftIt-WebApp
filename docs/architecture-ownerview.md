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
- Consistent styling through Tailwind + shadcn/ui

