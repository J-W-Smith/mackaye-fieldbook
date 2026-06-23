import rawContent from "../../../../content/demo/content.json";
import { contentBundleSchema } from "@mackaye/content-schema";

export const demoContent = contentBundleSchema.parse(rawContent);
