# Security Policy

Report vulnerabilities privately to the repository owner through GitHub. Do not open a public issue containing precise location data, tokens, private exports, or exploit details.

The prototype has no production backend and stores app records in local SQLite. It does not claim database-at-rest encryption. Future credentials must use platform secure storage and must never be committed.

Security-sensitive areas include malicious imports, accidental sharing, stolen-device access, location leakage, request-gate bypasses, and deletion failures.
