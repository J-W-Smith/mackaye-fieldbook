# Architecture

The Expo Router UI depends on interfaces and repositories rather than owning durable data. SQLite is the system of record for user data and settings. Bundled JSON is validated by Zod.

```mermaid
flowchart LR
  UI["Expo Router screens"] --> DB["SQLite repositories"]
  UI --> AC["Activity gate"]
  UI --> TS["TrackingService"]
  UI --> CS["Content schema"]
  DB --> OB["Local outbox"]
  OB --> MS["Manual mock sync"]
  AC --> TS
  AC --> MS
  AC --> NR["Network requests"]
```

All network-capable paths must call the global gate. The guide has no authentication dependency. Foreground Expo Location and deterministic mock tracking implement the same contract. Background tracking remains a disabled feature flag.
