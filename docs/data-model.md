# Data Model

SQLite tables:

- `journeys`: name, direction, optional dates, manual mileage, timestamps
- `journey_sections`: local section completion
- `journal_entries`: journal body and private notes
- `app_settings`: activity snapshot, battery mode, sync policy, network switch, last sync
- `outbox`: idempotency key, payload, status, attempt/success/failure timestamps

Bundled guide sections and points of interest are read-only JSON and are never deleted with user records. Foreign keys cascade journey deletion to journal/completion rows. SQL values use parameterized statements.
