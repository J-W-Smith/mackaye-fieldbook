import * as Location from "expo-location";
import type { BatteryMode } from "@mackaye/domain";
import { batteryProfiles } from "@mackaye/domain";
import type { TrackingService, TrackingStatus } from "@mackaye/sync-core";

export class ExpoForegroundTrackingService implements TrackingService {
  private subscription: Location.LocationSubscription | null = null;
  private status: TrackingStatus = { active: false, paused: false };
  private listeners = new Set<(status: TrackingStatus) => void>();

  constructor(private mode: BatteryMode = "BALANCED") {}

  setMode(mode: BatteryMode) {
    this.mode = mode;
  }

  async start() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) throw new Error("Foreground location permission was not granted.");
    const profile = batteryProfiles[this.mode];
    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: accuracyFor(this.mode),
        distanceInterval: profile.distanceIntervalMeters ?? undefined,
        timeInterval: profile.timeIntervalMs ?? undefined,
      },
      () => undefined,
    );
    this.update({ active: true, paused: false });
  }

  async startSimulation() {
    this.update({ active: true, paused: false });
  }

  async pause() {
    this.subscription?.remove();
    this.subscription = null;
    this.update({ active: false, paused: true });
  }

  async resume() {
    await this.start();
  }

  async stop() {
    this.subscription?.remove();
    this.subscription = null;
    this.update({ active: false, paused: false });
  }

  getStatus() {
    return this.status;
  }

  subscribeToStatus(listener: (status: TrackingStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private update(status: TrackingStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }
}

function accuracyFor(mode: BatteryMode) {
  if (mode === "HIGH_ACCURACY") return Location.Accuracy.Highest;
  if (mode === "BALANCED") return Location.Accuracy.High;
  return Location.Accuracy.Balanced;
}

export const backgroundTrackingFeatureEnabled = false;
export const trackingPlatformLabel = "Foreground device tracking";
