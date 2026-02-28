---
name: docs-update
description: Apply a focused documentation change with lightweight validation.
disable-model-invocation: true
---

# Docs Update Workflow

1. Identify exact doc sections to update from the request.
2. Edit only the minimum files needed to satisfy the ask.
3. Keep language concise, factual, and aligned with existing tone.
4. Run lightweight validation (targeted grep or markdown lint if configured).
5. Report changed files and what was clarified.

# Definition of Done

- Requested doc content is updated and internally consistent.
- References/paths/commands in edited text are valid.
- Verification output is summarized in one line.
