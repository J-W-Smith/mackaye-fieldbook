import { describe, expect, test } from "@jest/globals";
import {
  ActivityGate,
  MockSyncAdapter,
  MockTrackingService,
  safeRestartState,
  stopTrackingAndSync,
} from "..";

describe("global activity safety guarantees", () => {
  test("stop immediately pauses tracking and every network-capable capability", async () => {
    const gate = new ActivityGate("TRACKING_AND_SYNCING");
    const tracking = new MockTrackingService();
    await tracking.start();

    const snapshot = await stopTrackingAndSync(gate, tracking, "2026-06-23T00:00:00.000Z");

    expect(snapshot).toMatchObject({
      state: "ALL_ACTIVITY_PAUSED",
      pausedAt: "2026-06-23T00:00:00.000Z",
      gpsActive: false,
      backgroundTasksActive: false,
      networkEnabled: false,
      syncActive: false,
      uploadsActive: false,
    });
    expect(tracking.getStatus()).toEqual({ active: false, paused: true });
  });

  test("stop aborts active requests and prevents new mock sync requests", async () => {
    const gate = new ActivityGate("TRACKING_LOCAL");
    const request = gate.createAbortController();
    gate.transition("ALL_ACTIVITY_PAUSED");

    expect(request.signal.aborted).toBe(true);
    await expect(
      new MockSyncAdapter(gate).sync([{ id: "1", idempotencyKey: "journey:1", payload: "{}" }]),
    ).rejects.toThrow("paused");
  });

  test("restart never resumes a previously active state", () => {
    expect(safeRestartState("TRACKING_LOCAL")).toBe("ALL_ACTIVITY_PAUSED");
    expect(safeRestartState("TRACKING_SYNC_PENDING")).toBe("ALL_ACTIVITY_PAUSED");
    expect(safeRestartState("TRACKING_AND_SYNCING")).toBe("ALL_ACTIVITY_PAUSED");
    expect(safeRestartState("GUIDE_ONLY")).toBe("GUIDE_ONLY");
  });

  test("mock sync is idempotent by idempotency key", async () => {
    const result = await new MockSyncAdapter(new ActivityGate()).sync([
      { id: "1", idempotencyKey: "journey:1", payload: "{}" },
      { id: "2", idempotencyKey: "journey:1", payload: "{}" },
    ]);
    expect(result).toEqual({ attempted: 2, synchronized: 1 });
  });
});
