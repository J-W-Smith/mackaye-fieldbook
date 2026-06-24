import "fake-indexeddb/auto";
import { beforeEach, describe, expect, test } from "@jest/globals";
import {
  createJourney,
  getStorageMode,
  listJourneys,
  resetWebDatabaseForTests,
} from "../database.web";

describe("IndexedDB web persistence adapter", () => {
  beforeEach(async () => {
    await resetWebDatabaseForTests();
  });

  test("persists a browser-local journey across reads", async () => {
    await createJourney({ name: "Browser Test", direction: "northbound", manualMiles: 4.2 });
    const journeys = await listJourneys();

    expect(journeys).toHaveLength(1);
    expect(journeys[0]).toMatchObject({
      name: "Browser Test",
      direction: "northbound",
      manualMiles: 4.2,
    });
  });

  test("diagnostics report the actual IndexedDB adapter", async () => {
    await listJourneys();
    expect(getStorageMode()).toBe("IndexedDB");
  });
});
