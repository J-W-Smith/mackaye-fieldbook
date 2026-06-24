import { describe, expect, test } from "@jest/globals";
import { criticalWebRoutes, publicAssetPath, WEB_BASE_PATH } from "../web-config";

describe("C4 subdirectory web configuration", () => {
  test("uses the established C4 demo path", () => {
    expect(WEB_BASE_PATH).toBe("/demos/mackaye-fieldbook");
    expect(publicAssetPath("_expo/static/app.js")).toBe(
      "/demos/mackaye-fieldbook/_expo/static/app.js",
    );
  });

  test("includes all critical direct-navigation routes", () => {
    expect(criticalWebRoutes).toEqual(
      expect.arrayContaining([
        "index.html",
        "guide.html",
        "journey.html",
        "active.html",
        "settings.html",
        "about.html",
        "guide/demo-01.html",
      ]),
    );
  });
});
