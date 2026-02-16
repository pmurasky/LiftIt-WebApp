# LiftIt Web Application – Architecture Overview

## Framework & Tooling

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui component system
- Separate repository from backend

---

## Authentication Flow

- Auth0 Hosted Universal Login
- Web app redirects to Auth0 for authentication
- Receives JWT via OIDC flow
- Calls backend using Bearer token
- No authentication logic handled directly by backend UI

---

## API Integration

- Consumes REST API from backend
- Base path: `/api/v1/...`
- Uses standard HTTP verbs
- OpenAPI contract defines API structure

---

## Engineering Philosophy

- YAGNI
- Clean, minimal UI components
- Avoid premature abstraction
- Clear separation between UI logic and API logic
- Consistent styling through Tailwind + shadcn/ui

