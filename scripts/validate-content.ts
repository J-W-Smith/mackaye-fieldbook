import bundle from "../content/demo/content.json";
import { contentBundleSchema } from "@mackaye/content-schema";

const result = contentBundleSchema.safeParse(bundle);
if (!result.success) {
  console.error(result.error.issues);
  process.exit(1);
}

console.log(
  `Validated ${result.data.sections.length} demo sections and ${result.data.pointsOfInterest.length} demo points of interest.`,
);
