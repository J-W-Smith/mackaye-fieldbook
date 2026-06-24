import { describe, expect, jest, test } from "@jest/globals";
import { createExportPayload, exportFilename } from "../export.web";

jest.mock("@/db/database", () => ({ exportAllLocalData: jest.fn() }));

describe("web JSON export", () => {
  test("creates parseable JSON", () => {
    const payload = createExportPayload({ journeys: [{ id: "journey-1" }] });
    expect(JSON.parse(payload)).toEqual({ journeys: [{ id: "journey-1" }] });
  });

  test("uses a date-stamped browser download filename", () => {
    expect(exportFilename(new Date("2026-06-23T12:00:00Z"))).toBe(
      "mackaye-fieldbook-export-2026-06-23.json",
    );
  });
});
