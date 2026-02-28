---
name: test-only
description: Add or adjust tests only, with no production code changes.
disable-model-invocation: true
---

# Test-Only Workflow

1. Locate existing test patterns for the target module.
2. Add or update focused tests for the requested behavior.
3. Avoid production code edits unless explicitly requested.
4. Run the narrowest relevant test command first.
5. Report coverage intent and pass/fail status.

# Definition of Done

- Only test files (and snapshots/fixtures if needed) are changed.
- New or updated tests fail before and pass after intended change.
- Test command used for validation is included in the report.
