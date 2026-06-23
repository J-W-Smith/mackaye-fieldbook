# Testing Plan

Automated tests cover content validation, provenance rejection, immediate pause behavior, tracking shutdown, request abortion, network/sync blocking, idempotency, and restart non-resumption.

CI runs install, lint, TypeScript, Jest, content validation, formatting, and Expo Doctor. Future integration tests should use an in-memory SQLite adapter and React Native Testing Library for journey persistence, export shape, permission timing, tab navigation, and deletion isolation. Device tests must cover foreground permission denial, process death, airplane mode, low battery, large text, screen readers, and wet/gloved tap targets.
