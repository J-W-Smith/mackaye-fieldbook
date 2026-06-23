import type { ActivitySnapshot, ActivityState } from "@mackaye/domain";

export interface TrackingStatus {
  active: boolean;
  paused: boolean;
}

export interface TrackingService {
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  getStatus(): TrackingStatus;
  subscribeToStatus(listener: (status: TrackingStatus) => void): () => void;
}

export class MockTrackingService implements TrackingService {
  private status: TrackingStatus = { active: false, paused: false };
  private listeners = new Set<(status: TrackingStatus) => void>();

  async start() {
    this.setStatus({ active: true, paused: false });
  }
  async pause() {
    this.setStatus({ active: false, paused: true });
  }
  async resume() {
    this.setStatus({ active: true, paused: false });
  }
  async stop() {
    this.setStatus({ active: false, paused: false });
  }
  getStatus() {
    return this.status;
  }
  subscribeToStatus(listener: (status: TrackingStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private setStatus(status: TrackingStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }
}

export class ActivityGate {
  private snapshot: ActivitySnapshot;
  private abortControllers = new Set<AbortController>();

  constructor(initialState: ActivityState = "GUIDE_ONLY") {
    this.snapshot = snapshotFor(initialState, null);
  }

  getSnapshot() {
    return { ...this.snapshot };
  }

  transition(state: ActivityState, at = new Date().toISOString()) {
    const previousState = this.snapshot.state;
    this.snapshot = snapshotFor(state, previousState, at);
    if (state === "ALL_ACTIVITY_PAUSED") {
      this.abortControllers.forEach((controller) => controller.abort());
      this.abortControllers.clear();
    }
    return this.getSnapshot();
  }

  assertNetworkAllowed() {
    if (!this.snapshot.networkEnabled || this.snapshot.state === "ALL_ACTIVITY_PAUSED") {
      throw new Error("Network activity is paused by the global activity gate.");
    }
  }

  createAbortController() {
    this.assertNetworkAllowed();
    const controller = new AbortController();
    this.abortControllers.add(controller);
    controller.signal.addEventListener("abort", () => this.abortControllers.delete(controller));
    return controller;
  }

  setNetworkEnabled(enabled: boolean) {
    this.snapshot = { ...this.snapshot, networkEnabled: enabled };
    if (!enabled) {
      this.abortControllers.forEach((controller) => controller.abort());
      this.abortControllers.clear();
    }
    return this.getSnapshot();
  }
}

export function snapshotFor(
  state: ActivityState,
  previousState: ActivityState | null,
  at = new Date().toISOString(),
): ActivitySnapshot {
  if (state === "ALL_ACTIVITY_PAUSED") {
    return {
      state,
      previousState,
      pausedAt: at,
      gpsActive: false,
      backgroundTasksActive: false,
      networkEnabled: false,
      syncActive: false,
      uploadsActive: false,
    };
  }
  const tracking = state !== "GUIDE_ONLY";
  return {
    state,
    previousState,
    pausedAt: null,
    gpsActive: tracking,
    backgroundTasksActive: false,
    networkEnabled: true,
    syncActive: state === "TRACKING_AND_SYNCING",
    uploadsActive: state === "TRACKING_AND_SYNCING",
  };
}

export interface OutboxRecord {
  id: string;
  idempotencyKey: string;
  payload: string;
}

export interface SyncResult {
  attempted: number;
  synchronized: number;
}

export class MockSyncAdapter {
  constructor(private readonly gate: ActivityGate) {}

  async sync(records: OutboxRecord[]): Promise<SyncResult> {
    this.gate.assertNetworkAllowed();
    const unique = new Map(records.map((record) => [record.idempotencyKey, record]));
    return { attempted: records.length, synchronized: unique.size };
  }
}

export function safeRestartState(saved: ActivityState): ActivityState {
  return saved === "GUIDE_ONLY" || saved === "ALL_ACTIVITY_PAUSED" ? saved : "ALL_ACTIVITY_PAUSED";
}

export async function stopTrackingAndSync(
  gate: ActivityGate,
  tracking: TrackingService,
  at = new Date().toISOString(),
) {
  const snapshot = gate.transition("ALL_ACTIVITY_PAUSED", at);
  await tracking.pause();
  return snapshot;
}
