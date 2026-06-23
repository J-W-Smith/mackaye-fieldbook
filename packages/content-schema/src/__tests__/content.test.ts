import { describe, expect, test } from "@jest/globals";
import demoContent from "../../../../content/demo/content.json";
import { contentBundleSchema, trailSectionSchema } from "..";

describe("content validation", () => {
  test("bundled demo content is valid and explicitly non-navigational", () => {
    const content = contentBundleSchema.parse(demoContent);
    expect(content.disclaimer).toBe("Demonstration content only — not for real-world navigation.");
    expect(content.sections).toHaveLength(6);
    expect(content.pointsOfInterest).toHaveLength(12);
    expect(content.pointsOfInterest.every((point) => point.demoCoordinates)).toBe(true);
  });

  test("production-ready content without provenance is rejected", () => {
    const demo = demoContent.sections[0];
    const result = trailSectionSchema.safeParse({
      ...demo,
      contentStatus: "production",
      sourceCitation: "",
      verifiedAt: "",
      verifiedBy: "",
    });
    expect(result.success).toBe(false);
  });
});
