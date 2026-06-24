# MacKaye Fieldbook

MacKaye Fieldbook is an independent, offline-first field-guide and personal hiking-journal prototype inspired by the Benton MacKaye Trail. It is not affiliated with or endorsed by the Benton MacKaye Trail Association. All included trail content is fictional demonstration data and must not be used for navigation.

> **Demonstration content only — not for real-world navigation.**

**The trail guide that remembers your journey.**

Web companion deployment target: <https://c4-consultant.com/demos/mackaye-fieldbook/>

## What works

- Five-tab Expo app for Android, iPhone, and web development
- Bundled, searchable fictional guide with six sections and twelve demo points of interest
- Northbound/southbound section views, difficulty/category filters, and provenance badges
- SQLite journeys, completion records, journal entries, private notes, mileage, dates, editing, and deletion
- Foreground-only Expo Location tracking behind a service interface
- Persisted activity state with an immediate **STOP TRACKING & SYNC** control
- Global network gate, local outbox, manual mock sync, and explicit resume
- JSON export through the platform share sheet
- Battery modes, diagnostics, privacy settings, and serious local-data deletion flow

No account, backend, cloud service, analytics, advertising SDK, real trail data, or offline map package is required.

## Repository

```text
apps/mobile/              Expo Router application
packages/domain/          Shared types and centrally defined battery profiles
packages/content-schema/  Zod content/provenance validation
packages/sync-core/       Activity gate, tracking contract, and mock sync
content/demo/             Fictional, non-navigational content
docs/                     Product, architecture, privacy, safety, and roadmap docs
```

## Requirements

- Node.js 22 or 24 LTS
- pnpm 11
- Android Studio for an Android emulator, or an Android device with Expo Go
- macOS with Xcode for the iOS Simulator; a physical iPhone can use Expo Go from Windows/macOS

## Setup

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm run validate:content
pnpm run typecheck
pnpm run lint
pnpm test --runInBand
pnpm --filter @mackaye/mobile start
```

On macOS/Linux, use the same commands in a POSIX shell. Press `a` for Android, `i` for iOS on macOS, or scan the Expo QR code from a device.

## Web companion

Run local web development:

```powershell
pnpm --filter @mackaye/mobile web
```

Build and verify the C4 subdirectory export:

```powershell
pnpm export:web
pnpm verify:web-export
pnpm deploy:web -- --dry-run
```

The production build uses `/demos/mackaye-fieldbook` as its Expo base URL and writes only deployable static files to `apps/mobile/dist-web`. The focused FTP script reads credentials from the shell environment and never stores them in source.

Web records use IndexedDB when supported. Browser location is foreground-only, may be throttled when a tab is inactive, and ends when the tab closes. Safe simulation works without location permission. Background GPS, cloud accounts, real maps, and real trail content are not implemented.

See [docs/web-companion.md](docs/web-companion.md), [docs/web-deployment.md](docs/web-deployment.md), and [docs/web-platform-differences.md](docs/web-platform-differences.md).

## Safety and privacy

The app is not an emergency service, satellite communicator, official guide, or substitute for current maps, alerts, preparation, equipment, and judgment. GPS starts only after an explicit action. Background tracking is disabled. Restarting never resumes previously active tracking. Local guide and journal access remain available while all activity is paused.

Code and content licensing have not yet been selected. See [docs/license-decision.md](docs/license-decision.md).
