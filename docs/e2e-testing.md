# End-to-End Testing (Playwright)

This repository uses Playwright for browser-level smoke and workflow tests.

## Run locally

1. Install dependencies:

```bash
npm ci
```

2. Install browser binaries (first run only):

```bash
npx playwright install chromium
```

3. Run E2E tests:

```bash
npm run test:e2e
```

Optional interactive runner:

```bash
npm run test:e2e:ui
```

## Notes

- E2E tests start a local Next.js dev server via `playwright.config.ts`.
- Test server defaults to stub profile mode with test-safe Auth0 environment values.
- Current scope is smoke coverage; issue #17 acceptance flows are tracked for later expansion.
