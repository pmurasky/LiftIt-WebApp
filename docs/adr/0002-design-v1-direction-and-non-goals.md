# ADR-0002: Design v1 Direction and Non-Goals

## Status

Accepted

## Date

2026-02-22

## Context

High-priority design issues (`#10`, `#13`, `#14`, `#16`) required a clear visual direction before broader UI rollout. Without a documented direction, styling work risked inconsistency across pages, repeated redesign, and avoidable rework.

As implementation planning matured, the team also identified repeated style patterns across components and pages. The de-duplication effort is now tracked in `#32` with implementation issues `#28`, `#29`, `#30`, and `#31`.

LiftIt is used in two primary contexts:
- Mobile browser during workouts
- Desktop browser for planning and review

We already accepted responsive support in ADR-0001. This ADR defines the visual direction and non-goals that guide token implementation and feature-level UI choices.

## Decision

Adopt a **performance-forward coaching UI** direction for v1:
- Clear hierarchy and fast scanability over decorative density
- Strong contrast and concise copy for in-gym readability
- Mobile-first layouts that scale to desktop without separate design systems

To keep the look and feel consistent and maintainable:
- Define shared visual primitives through semantic tokens and reusable style patterns
- Avoid per-page visual redefinition when an existing token/primitive can be reused
- Use local component/page styles only for truly unique presentation needs

### Visual Principles

1. **Clarity first**: prioritize immediate understanding of key actions and metrics
2. **Consistent primitives**: rely on shared spacing, typography, and semantic color tokens
3. **Action-oriented screens**: design around user tasks (start workout, log set, review progress)
4. **Accessible defaults**: keyboard support, visible focus states, and sufficient contrast

### Non-Goals (v1)

- Building a highly animated, novelty-first interface
- Introducing multiple theme families per feature
- Creating custom one-off component styles that bypass shared tokens
- Optimizing for tablet-specific layouts as a separate design target

## Alternatives Considered

### Alternative 1: Keep design direction implicit
- **Pros**: no upfront docs work
- **Cons**: inconsistent implementation and slower reviews
- **Why rejected**: conflicts with #16 tracking objective and token rollout consistency

### Alternative 2: Build a highly expressive visual system first
- **Pros**: potentially distinctive look
- **Cons**: higher implementation risk and delayed delivery for core flows
- **Why rejected**: v1 priority is consistency and usability, not visual experimentation

## Consequences

### Positive
- Faster, more consistent frontend decisions across issues #13 and #14
- Clear review criteria for future UI pull requests
- Reduced chance of style drift during rapid feature delivery
- Lower maintenance overhead from fewer duplicated style definitions

### Negative
- Some creative flexibility is intentionally constrained in v1
- Future rebranding may require token remapping and component updates
- Initial migration work is required to replace duplicated local styles

### Neutral
- Does not change current framework/tooling decisions
- Works with current Tailwind + shadcn/ui stack

## References

- Issue #10: Design v1: choose visual direction + non-goals
- Issue #13: implement tokens as CSS variables/theme config
- Issue #14: apply v1 styling tokens to top user flows
- Issue #16: v1 webapp styling and design system rollout
- Issue #28: audit duplicated styling patterns across pages/components
- Issue #29: create shared styling layer for reusable visual primitives
- Issue #30: migrate key page components to shared style primitives
- Issue #31: add guardrails to prevent future style duplication
- Issue #32: epic - eliminate duplicated styling across web page components
- ADR-0001: responsive design mobile and desktop
