# Threat Model

| Threat                    | Current control                                  | Remaining work                                 |
| ------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Stolen device             | Local-only data, no cloud exposure               | Optional DB encryption and app lock evaluation |
| Location leakage          | Foreground-only, explicit start/stop, no uploads | OS privacy review and track minimization       |
| Malicious imports         | Zod validation boundary                          | Import UI, size limits, fuzzing, signatures    |
| Shared-link exposure      | Feature absent                                   | Expiry, revocation, access logs, redaction     |
| Accidental public sharing | Sharing features absent; explicit JSON export    | Export warnings and selective export           |
| Network gate bypass       | Central gate and tests                           | Static rule/code review for every adapter      |
