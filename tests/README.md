# Tests

## Directory structure

```
tests/
  unit/       Pure JavaScript unit tests — no browser required
  e2e/        Browser-based end-to-end tests (Playwright)
  manual/     Manual HTML pages for exploratory/visual testing
```

## Running tests

### Unit tests (bus logic)

```
npm test
```

or directly:

```
node --test tests/unit/bus.spec.mjs
```

These use Node.js's built-in `node:test` runner and cover:

- Basic publish/subscribe (exact topics, object form, multiple subscribers)
- Single-level wildcard `+` matching
- Multi-level wildcard `#` matching
- Unsubscribe (string form, object form, wildcard topics)
- Connection-oriented API: `provide`, `withhold`, `connect`, `invoke`

### End-to-end tests (browser)

```
npm run test:e2e
```

Requires browser engines installed (`npx playwright install`).

### Manual tests

Open the HTML files in `tests/manual/` via the dev server:

```
npm run dev
```
