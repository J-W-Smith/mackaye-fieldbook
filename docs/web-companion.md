# Web Companion

The web companion reuses the Expo Router application and shared domain, content-schema, activity-gate, tracking, and sync packages. It is a public project preview and desktop-friendly interactive demonstration, not a separate product fork.

## Public experience

The root route presents the original artwork, product purpose, independent/unofficial notice, fictional-data warning, battery-mode concepts, Stop Tracking & Sync behavior, and a link to the interactive five-tab demo.

The interactive routes remain Guide, Journey, Active Hike, Settings, and About. Guide content is bundled into the static export and makes no runtime content request.

## Browser persistence

Web builds resolve `database.web.ts`, which stores one versioned application state in IndexedDB. It supports journeys, journal entries, section completion, settings, the manual mock outbox, export, and deletion. Diagnostics report either:

- `IndexedDB`
- `Memory-only fallback`

Memory fallback appears only when IndexedDB is unavailable and displays a visible data-loss warning.

## Browser activity

Browser geolocation is never called during module construction, app initialization, guide browsing, or journey use. The Active Hike screen offers:

- `START FOREGROUND BROWSER TRACKING`, which invokes `navigator.geolocation.watchPosition` after the click.
- `START SAFE SIMULATION`, which demonstrates the activity state machine without requesting location.

Stop clears the current watch, closes the activity/network gate, pauses sync/uploads, and persists the paused state. Browser reload converts any active saved state to `ALL_ACTIVITY_PAUSED`.

Browsers may throttle inactive tabs. Tracking does not continue after the tab closes and no background tracking claim is made.

## Resource behavior

There is no polling, WebSocket, heartbeat, analytics, advertising, tracking pixel, remote map library, backend request, or remote content fetch. The exported application is static.
