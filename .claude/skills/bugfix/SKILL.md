---
name: bugfix
description: Fix a reproducible bug with minimal context and targeted verification.
disable-model-invocation: true
---

# Bugfix Workflow

1. Confirm the failure signal (error text, failing test, or broken behavior).
2. Scope to the smallest relevant files before editing.
3. Implement a root-cause fix, not a symptom patch.
4. Run the smallest verification that proves the fix.
5. Report changed files, root cause, and verification result.

# Definition of Done

- Bug is reproducible before and resolved after the change.
- Verification command for the touched scope passes.
- No unrelated refactors or broad file churn.
