---
name: small-refactor
description: Perform a behavior-preserving refactor in a narrow scope.
disable-model-invocation: true
---

# Small Refactor Workflow

1. Confirm scope boundaries and identify touched files.
2. Refactor for clarity/reuse while preserving behavior.
3. Avoid API changes unless explicitly requested.
4. Run targeted tests or typecheck for affected scope.
5. Report what improved and how behavior was verified.

# Definition of Done

- Refactor keeps external behavior unchanged.
- Duplication/complexity in touched scope is reduced.
- Verification for affected scope passes.
