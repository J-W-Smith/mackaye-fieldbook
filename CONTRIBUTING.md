# Contributing

This private prototype accepts small, reviewable changes.

1. Create a branch from `main`.
2. Keep UI, persistence, content, tracking, and sync boundaries separate.
3. Never add real trail guidance without recorded permission, provenance, and verification.
4. Run `pnpm lint`, `pnpm typecheck`, `pnpm test --runInBand`, `pnpm validate:content`, and `pnpm format:check`.
5. Explain privacy, battery, safety, and offline behavior changes in the pull request.

For web changes, also run:

```text
pnpm export:web
pnpm verify:web-export
pnpm exec expo-doctor apps/mobile
```

The web export must retain `/demos/mackaye-fieldbook` asset paths, IndexedDB persistence, explicit foreground geolocation, and the no-auto-resume guarantee. Do not add production FTP deployment to pull-request CI.

Do not add association branding, copied guide text, scraped data, secrets, analytics, advertising, or silent background behavior.
