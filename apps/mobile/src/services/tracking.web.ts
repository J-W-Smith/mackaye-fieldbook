import type { BatteryMode } from "@mackaye/domain";
import type { TrackingService, TrackingStatus } from "@mackaye/sync-core";

type BrowserGeolocation = Pick<Geolocation, "watchPosition" | "clearWatch">;

export class ExpoForegroundTrackingService implements TrackingService {
  private watchId: number | null = null;
  private simulated = false;
  private pausedWasSimulation = false;
  private status: TrackingStatus = { active: false, paused: false };
  private listeners = new Set<(status: TrackingStatus) => void>();

  constructor(
    private mode: BatteryMode = "BALANCED",
    private readonly geolocation: BrowserGeolocation | undefined = typeof navigator === "undefined"
      ? undefined
      : navigator.geolocation,
  ) {}

  setMode(mode: BatteryMode) {
    this.mode = mode;
  }

  async start() {
    if (!this.geolocation) {
      throw new Error("Browser geolocation is unavailable. Use simulation mode.");
    }
    this.simulated = false;
    this.pausedWasSimulation = false;
    this.watchId = this.geolocation.watchPosition(
      () => this.update({ active: true, paused: false }),
      () => this.update({ active: false, paused: true }),
      {
        enableHighAccuracy: this.mode === "HIGH_ACCURACY",
        maximumAge: this.mode === "BATTERY_SAVER" ? 120000 : 30000,
        timeout: 15000,
      },
    );
    this.update({ active: true, paused: false });
  }

  async startSimulation() {
    this.clearWatch();
    this.simulated = true;
    this.pausedWasSimulation = false;
    this.update({ active: true, paused: false });
  }

  async pause() {
    this.pausedWasSimulation = this.simulated;
    this.clearWatch();
    this.simulated = false;
    this.update({ active: false, paused: true });
  }

  async resume() {
    if (this.pausedWasSimulation) await this.startSimulation();
    else await this.start();
  }

  async stop() {
    this.clearWatch();
    this.simulated = false;
    this.pausedWasSimulation = false;
    this.update({ active: false, paused: false });
  }

  getStatus() {
    return this.status;
  }

  getModeLabel() {
    return this.simulated ? "Browser simulation" : "Foreground browser tracking";
  }

  subscribeToStatus(listener: (status: TrackingStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private clearWatch() {
    if (this.watchId !== null) {
      this.geolocation?.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private update(status: TrackingStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }
}

export const backgroundTrackingFeatureEnabled = false;
export const trackingPlatformLabel = "Foreground browser tracking";
