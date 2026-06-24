import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { criticalWebRoutes, publicAssetPath, WEB_BASE_PATH, WEB_OUTPUT_DIR } from "./web-config";

async function main() {
  const outputDir = path.resolve(WEB_OUTPUT_DIR);
  const requiredFiles = [
    ...criticalWebRoutes,
    ".htaccess",
    "manifest.json",
    "robots.txt",
    "icon-192.png",
    "icon-512.png",
    "demo-folder-check.txt",
  ];

  for (const relativePath of requiredFiles) {
    await access(path.join(outputDir, relativePath));
  }

  const files = await walk(outputDir);
  const textFiles = files.filter((file) => /\.(html|js|json|txt|css|htaccess)$/i.test(file));
  const forbiddenPatterns = [
    /https?:\/\/localhost/i,
    /https?:\/\/127\.0\.0\.1/i,
    /C:\\Users\\/i,
    /\/Users\//i,
    /\/home\//i,
    /FTP_PASSWORD/i,
    /sk-[A-Za-z0-9_-]{12,}/,
    /gh[opusr]_[A-Za-z0-9]{12,}/,
  ];

  for (const file of textFiles) {
    const contents = await readFile(file, "utf8");
    if (/\.html$/i.test(file) && /\b(?:localhost|127\.0\.0\.1)\b/i.test(contents)) {
      throw new Error(`Localhost marker found in HTML: ${path.relative(outputDir, file)}`);
    }
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(contents)) {
        throw new Error(
          `Forbidden build marker ${pattern} found in ${path.relative(outputDir, file)}`,
        );
      }
    }
  }

  const index = await readFile(path.join(outputDir, "index.html"), "utf8");
  if (!index.includes(publicAssetPath("_expo/"))) {
    throw new Error(`index.html does not reference assets under ${WEB_BASE_PATH}`);
  }
  if (!index.includes("Demonstration content only")) {
    throw new Error("Landing HTML is missing the fictional-data warning.");
  }
  const htaccess = await readFile(path.join(outputDir, ".htaccess"), "utf8");
  for (const rule of [
    "RewriteCond %{REQUEST_FILENAME}.html -f",
    "RewriteCond %{REQUEST_URI} \\.[A-Za-z0-9]+$ [NC]",
    "RewriteRule ^ index.html [L]",
  ]) {
    if (!htaccess.includes(rule)) throw new Error(`Missing scoped Apache rule: ${rule}`);
  }

  const totalBytes = (await Promise.all(files.map(async (file) => (await stat(file)).size))).reduce(
    (sum, size) => sum + size,
    0,
  );

  console.log(`Static export verification passed: ${files.length} files.`);
  console.log(`Critical routes verified: ${criticalWebRoutes.length}.`);
  console.log(`Base path verified: ${WEB_BASE_PATH}.`);
  console.log(`Output size: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB.`);
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    }),
  );
  return files.flat();
}

void main();
