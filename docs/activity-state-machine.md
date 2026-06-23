# Activity State Machine

```mermaid
stateDiagram-v2
  [*] --> GUIDE_ONLY
  GUIDE_ONLY --> TRACKING_LOCAL: Start hike
  TRACKING_LOCAL --> TRACKING_SYNC_PENDING: Local changes
  TRACKING_SYNC_PENDING --> TRACKING_AND_SYNCING: Explicit sync
  TRACKING_AND_SYNCING --> TRACKING_LOCAL: Sync completes
  GUIDE_ONLY --> ALL_ACTIVITY_PAUSED: Stop
  TRACKING_LOCAL --> ALL_ACTIVITY_PAUSED: Stop
  TRACKING_SYNC_PENDING --> ALL_ACTIVITY_PAUSED: Stop
  TRACKING_AND_SYNCING --> ALL_ACTIVITY_PAUSED: Stop
  ALL_ACTIVITY_PAUSED --> TRACKING_LOCAL: Explicit resume
```

Stop aborts registered requests, blocks new network work, pauses tracking, disables sync/uploads/background activity, records `pausedAt`, and persists `ALL_ACTIVITY_PAUSED`. Any active state restored after process restart is converted to paused. Reconnection, charging, and app launch never resume activity.
