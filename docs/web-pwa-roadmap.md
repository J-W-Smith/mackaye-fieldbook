# Web PWA Roadmap

Phase 1 includes:

- a web app manifest;
- original 192px and 512px icons;
- theme and background colors;
- standalone display intent;
- canonical, Open Graph, social-card, favicon, and robots metadata.

Offline app-shell service-worker caching is intentionally deferred. Expo warns that aggressive service workers can trap stale web builds and make updates difficult. That risk is material for safety disclaimers and guide content.

Before adding a service worker:

1. Define a versioned cache name tied to the release commit.
2. Network-first or revalidation behavior must apply to HTML and safety content.
3. Hashed immutable assets may use cache-first.
4. Add an update-available banner with explicit reload.
5. Test cache replacement, failed updates, offline launch, and rollback.
6. Ensure outdated disclaimers/content cannot persist indefinitely.

Until those checks exist, the manifest provides modest install metadata but the project does not claim reliable offline PWA installation.
