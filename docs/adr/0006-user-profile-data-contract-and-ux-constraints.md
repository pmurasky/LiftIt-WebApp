# ADR-0006: User Profile Data Contract and UX Constraints

## Status

Proposed

## Date

2026-02-21

## Context

User profile work is now tracked as high-priority across:
- Issue #20: requirements discussion
- Issue #18: backend API and data model
- Issue #19: frontend profile screen

Implementation is blocked by unresolved scope: exact fields, editability, and validation. We need a baseline contract that allows backend and frontend to proceed in parallel while keeping room for iteration.

## Decision

Define a v1 profile contract with a small required core and optional extended fields.

### v1 Profile Fields

Required:
- `name` (editable)
- `email` (read-only, sourced from Auth provider)
- `units` (`metric` or `imperial`, editable)
- `timezone` (editable)

Optional:
- `height`
- `currentWeight`
- `targetWeight`
- `birthYear`
- `gender`
- `fitnessGoal` (enum, e.g. `strength`, `endurance`, `weight_loss`, `general_fitness`)
- `preferredWorkoutDays` (array of weekday enums)
- `preferredSessionMinutes`
- `emailNotificationsEnabled`
- `workoutRemindersEnabled`

### Editability Rules

- `email` is read-only in profile UI and backend update endpoint
- All other fields are user-editable if present in payload
- Unknown fields are rejected by backend validation

### API Contract (v1)

- `GET /api/v1/users/profile` returns full profile payload
- `PATCH /api/v1/users/profile` performs partial updates
- Validation errors return consistent 4xx response shape
- Unauthorized and forbidden responses follow existing API error handling expectations

### UX Constraints

- Must satisfy ADR-0001 responsive requirements (mobile + desktop)
- Profile UI is a full page route, not a modal
- Mobile layout uses single-column sections; desktop may use multi-column groupings
- Save action is explicit (no silent auto-save in v1)

## Alternatives Considered

### Alternative 1: Ship only name/email in v1
- **Pros**: fastest implementation
- **Cons**: limited user value; likely immediate follow-up rework
- **Why rejected**: does not meet expected personalization needs for fitness workflows

### Alternative 2: Large comprehensive profile schema from day one
- **Pros**: future-proof breadth
- **Cons**: more backend/frontend complexity, slower delivery, higher validation burden
- **Why rejected**: unnecessary for v1 and conflicts with incremental delivery approach

## Consequences

### Positive
- Backend and frontend can proceed with a shared baseline contract
- Keeps v1 scope practical while enabling personalization
- Aligns with existing auth model (identity source remains Auth provider)

### Negative
- Some fields may be revised after issue #20 discussion closes
- Enum choices may evolve, requiring migration/versioning decisions later

### Neutral
- No immediate changes to auth architecture
- Uses existing API client and error handling patterns

## Follow-up

- Finalize unresolved field details in issue #20
- Update issues #18 and #19 with finalized field list and validation rules
- If major changes are needed, supersede this ADR with a new one

## References

- Issue #20: Define User Profile Fields and Requirements
- Issue #18: User Profile - Backend API and data model
- Issue #19: User Profile Screen - Frontend UI
- ADR-0001: responsive design mobile and desktop
