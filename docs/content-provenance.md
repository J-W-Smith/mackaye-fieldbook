# Content Provenance

Every future real content item must record author/source, permission or license, date obtained, last verified date, verification method, geographic scope, source classification, uncertainty, and reviewer.

```mermaid
flowchart LR
  S["Source identified"] --> P["Permission/license recorded"]
  P --> D["Draft entered"]
  D --> V["Geographic and factual verification"]
  V --> R["Reviewer approval"]
  R --> PR["Production status"]
  PR --> RV["Scheduled re-verification"]
```

Schema validation rejects production-status content missing citation, verification date, or reviewer. Phase 1 content is fictional and labeled demo. Do not scrape or reproduce association guidebooks or web content.
