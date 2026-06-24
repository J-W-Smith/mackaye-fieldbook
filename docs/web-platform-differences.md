# Web Platform Differences

| Capability     | Android/iOS target           | Web companion                                      |
| -------------- | ---------------------------- | -------------------------------------------------- |
| Offline guide  | Supported                    | Supported                                          |
| Local journal  | SQLite                       | IndexedDB adapter; visible memory fallback warning |
| Foreground GPS | Supported                    | Browser permission and active-tab constraints      |
| Background GPS | Future/native only           | Not supported                                      |
| Stop control   | Stops native services/gates  | Clears browser watch/gates                         |
| JSON export    | Share/file flow              | Browser download                                   |
| Cloud account  | Future                       | Future                                             |
| Maps           | Future licensed offline maps | Future preview only                                |

Browser activity may be throttled or suspended when the tab is inactive. Closing the tab ends browser tracking. Reload never silently resumes tracking.

The web companion uses a subdirectory base URL and static Apache routing. Native platforms do not use the web base path or Apache rules.
