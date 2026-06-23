import { z } from "zod";

const verificationSchema = z
  .object({
    sourceType: z.enum(["fictional-demo", "official", "personal", "community", "inferred"]),
    sourceCitation: z.string(),
    verifiedAt: z.string(),
    verifiedBy: z.string(),
    confidence: z.enum(["low", "medium", "high"]),
    contentStatus: z.enum(["demo", "draft", "production"]),
  })
  .superRefine((item, context) => {
    if (
      item.contentStatus === "production" &&
      (!item.sourceCitation.trim() || !item.verifiedAt.trim() || !item.verifiedBy.trim())
    ) {
      context.addIssue({
        code: "custom",
        message: "Production content requires provenance and verification.",
      });
    }
  });

export const trailSectionSchema = verificationSchema.and(
  z.object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    region: z.string().min(1),
    order: z.number().int().positive(),
    startLabel: z.string().min(1),
    endLabel: z.string().min(1),
    approximateMiles: z.number().positive(),
    northboundSummary: z.string().min(1),
    southboundSummary: z.string().min(1),
    difficulty: z.enum(["easy", "moderate", "strenuous"]),
    elevationNotes: z.string(),
    waterNotes: z.string(),
    campingNotes: z.string(),
    seasonalNotes: z.string(),
    navigationCautions: z.string(),
    historicalNotes: z.string(),
    fieldNotes: z.string(),
  }),
);

export const pointOfInterestSchema = verificationSchema.and(
  z.object({
    id: z.string().min(1),
    sectionId: z.string().min(1),
    type: z.enum(["water", "camping", "history", "caution", "view", "access"]),
    title: z.string().min(1),
    description: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    mileMarker: z.number().nonnegative(),
    directionNotes: z.string(),
    demoCoordinates: z.literal(true),
  }),
);

export const contentBundleSchema = z
  .object({
    disclaimer: z.literal("Demonstration content only — not for real-world navigation."),
    sections: z.array(trailSectionSchema).min(6),
    pointsOfInterest: z.array(pointOfInterestSchema).min(12),
  })
  .superRefine((bundle, context) => {
    const sectionIds = new Set(bundle.sections.map((section) => section.id));
    for (const poi of bundle.pointsOfInterest) {
      if (!sectionIds.has(poi.sectionId)) {
        context.addIssue({
          code: "custom",
          message: `Point of interest ${poi.id} references unknown section ${poi.sectionId}.`,
        });
      }
    }
  });

export type ContentBundle = z.infer<typeof contentBundleSchema>;
