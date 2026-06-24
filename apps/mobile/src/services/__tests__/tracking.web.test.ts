import { describe, expect, jest, test } from "@jest/globals";
import { ExpoForegroundTrackingService } from "../tracking.web";

describe("foreground browser tracking", () => {
  test("does not request geolocation during construction or normal guide use", () => {
    const watchPosition = jest.fn<Geolocation["watchPosition"]>();
    new ExpoForegroundTrackingService("BALANCED", {
      watchPosition,
      clearWatch: jest.fn(),
    });
    expect(watchPosition).not.toHaveBeenCalled();
  });

  test("stop clears the active browser watch", async () => {
    const clearWatch = jest.fn();
    const watchPosition = jest.fn(() => 42);
    const tracking = new ExpoForegroundTrackingService("BALANCED", {
      watchPosition: watchPosition as Geolocation["watchPosition"],
      clearWatch,
    });

    await tracking.start();
    await tracking.pause();

    expect(watchPosition).toHaveBeenCalledTimes(1);
    expect(clearWatch).toHaveBeenCalledWith(42);
    expect(tracking.getStatus()).toEqual({ active: false, paused: true });
  });

  test("safe simulation requests no browser permission", async () => {
    const watchPosition = jest.fn<Geolocation["watchPosition"]>();
    const tracking = new ExpoForegroundTrackingService("BALANCED", {
      watchPosition,
      clearWatch: jest.fn(),
    });
    await tracking.startSimulation();
    expect(watchPosition).not.toHaveBeenCalled();
    expect(tracking.getStatus().active).toBe(true);
  });

  test("explicit resume preserves simulation without requesting location", async () => {
    const watchPosition = jest.fn<Geolocation["watchPosition"]>();
    const tracking = new ExpoForegroundTrackingService("BALANCED", {
      watchPosition,
      clearWatch: jest.fn(),
    });
    await tracking.startSimulation();
    await tracking.pause();
    await tracking.resume();
    expect(watchPosition).not.toHaveBeenCalled();
    expect(tracking.getStatus()).toEqual({ active: true, paused: false });
  });
});
