export const WEB_BASE_PATH = "/demos/mackaye-fieldbook";
export const WEB_CANONICAL_URL = "https://c4-consultant.com/demos/mackaye-fieldbook/";
export const WEB_OUTPUT_DIR = "apps/mobile/dist-web";

export const criticalWebRoutes = [
  "index.html",
  "guide.html",
  "journey.html",
  "active.html",
  "settings.html",
  "about.html",
  "guide/demo-01.html",
] as const;

export function publicAssetPath(relativePath: string) {
  return `${WEB_BASE_PATH}/${relativePath.replace(/^\/+/, "")}`;
}
