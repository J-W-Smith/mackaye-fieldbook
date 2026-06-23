# Offline Maps Evaluation

No real map is implemented in Phase 1.

- **MapLibre Native:** strongest open mobile rendering candidate; requires style, tile, attribution, native-build, and package-download work.
- **Local vector/raster packages:** predictable offline behavior but download size, updates, storage cleanup, and licensing must be explicit.
- **MBTiles/PMTiles:** MBTiles has broad tooling but mobile integration is native; PMTiles is attractive for range requests but true offline packages need local-file support verification on both platforms.
- **OpenStreetMap:** attribution is mandatory; ODbL obligations and produced-database rules require legal review.
- **Elevation:** increases package size and needs independently licensed source data.
- **Route data:** must have explicit redistribution rights; no association route data should be assumed reusable.
- **Updates:** versioned regions, checksums, resumable downloads, rollback, and stale-data warnings.
- **Battery:** map rendering, GPS, hillshade, and frequent camera updates require profiling.

Google Maps tiles must not be cached for unauthorized offline use. Phase 1 uses text-only non-navigational placeholders.
