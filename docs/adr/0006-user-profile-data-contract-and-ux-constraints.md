# ADR-0006: User Profile API Contract and UX Constraints

## Status

Accepted

## Date

2026-02-21

## Context

Backend handoff clarified the user profile API behavior and field contract used by the frontend.

Relevant issues:
- #20 requirements discussion
- #18 backend API and model tracking
- #19 frontend profile screen

The contract must support a stateless Auth0-based flow and mobile/desktop UX requirements from ADR-0001.

## Decision

Adopt the backend handoff contract as the frontend integration baseline.

### Authentication

- Every request uses `Authorization: Bearer <access_token>`
- Backend is stateless (no session cookies)
- Backend never accepts or stores passwords

### Live Endpoint (available now)

- `POST /api/v1/users/me` for first-login provisioning
- Request body:
  - `auth0Id` (required)
  - `email` (required)
- Expected outcomes:
  - `201 Created` when user is provisioned
  - `409 Conflict` when user already exists (frontend should continue)

### Profile Endpoints (planned / not live yet)

- `POST /api/v1/users/me/profile`
- `GET /api/v1/users/me/profile`

Profile create fields:
- Required:
  - `username` (1-30 chars, unique)
  - `unitsPreference` (`metric` or `imperial`, default `metric`)
- Optional:
  - `displayName` (max 100 chars)
  - `gender` (`male`, `female`, `non_binary`, `prefer_not_to_say`, or null)
  - `birthdate` (`YYYY-MM-DD`)
  - `heightCm` (decimal, nullable)

### Hard Rules

- `username` is user-supplied (not backend-generated)
- Profile is one-to-one with user
- No profile weight field (`body_weight_history` handles weight timeline)
- Height is stored in centimeters on the wire regardless of display preference
- Optional fields may be omitted or null

### Frontend Flow

1. Auth0 sign-in
2. `POST /api/v1/users/me`
   - `201` -> continue
   - `409` -> continue
3. `GET /api/v1/users/me/profile`
   - `200` -> main app
   - `404` -> show onboarding
4. Onboarding submits `POST /api/v1/users/me/profile`

### UX Constraints

- Must satisfy ADR-0001 responsive requirements (mobile + desktop)
- Profile/onboarding remains a full-page route
- Explicit save/create action (no silent auto-save)
- `birthdate` input is date-only
- Unit conversion happens in UI only; API payload remains metric-normalized

## Consequences

### Positive
- Frontend and backend share an explicit handoff contract
- Reduces ambiguity in issue #19 implementation
- Preserves clean separation between identity (Auth0) and profile domain data

### Negative
- Frontend is partially blocked until profile endpoints are deployed
- Future enum/value expansion may require ADR follow-up

### Neutral
- API client and `ApiError` patterns remain valid
- No change to authentication architecture

## Follow-up

- Keep issue #19 focused on UI + flow integration against this contract
- Track backend profile endpoint delivery explicitly (see new frontend dependency issue)
- Supersede this ADR only if backend contract changes materially

## References

- Issue #18: User Profile - Backend API and data model
- Issue #19: User Profile Screen - Frontend UI
- Issue #20: Define User Profile Fields and Requirements
- ADR-0001: responsive design mobile and desktop
