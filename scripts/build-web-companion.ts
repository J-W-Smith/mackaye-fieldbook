import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { WEB_BASE_PATH, WEB_OUTPUT_DIR } from "./web-config";

async function main() {
  const repoRoot = process.cwd();
  const outputDir = path.join(repoRoot, WEB_OUTPUT_DIR);
  const mobileRoot = path.join(repoRoot, "apps", "mobile");
  const pnpmScript = process.env.npm_execpath;
  if (!pnpmScript) throw new Error("pnpm executable path is unavailable.");

  const result = spawnSync(
    process.execPath,
    [
      pnpmScript,
      "--filter",
      "@mackaye/mobile",
      "exec",
      "expo",
      "export",
      "--platform",
      "web",
      "--output-dir",
      "dist-web",
    ],
    {
      cwd: repoRoot,
      stdio: "inherit",
      env: { ...process.env, EXPO_PUBLIC_BASE_URL: WEB_BASE_PATH },
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);

  await mkdir(outputDir, { recursive: true });
  await copyFile(
    path.join(mobileRoot, "public", "icon-512.png"),
    path.join(outputDir, "icon-512.png"),
  );
  await copyFile(
    path.join(mobileRoot, "public", "icon-192.png"),
    path.join(outputDir, "icon-192.png"),
  );
  await writeFile(
    path.join(outputDir, ".htaccess"),
    `DirectoryIndex index.html
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+?)/?$ $1.html [L]

RewriteCond %{REQUEST_URI} \\.[A-Za-z0-9]+$ [NC]
RewriteRule ^ - [L]

RewriteRule ^ index.html [L]
`,
    "utf8",
  );
  await writeFile(
    path.join(outputDir, "demo-folder-check.txt"),
    "MacKaye Fieldbook web companion folder is present.\nDemonstration content only — not for real-world navigation.\n",
    "utf8",
  );

  console.log(`Web companion exported for ${WEB_BASE_PATH}`);
  console.log(`Output: ${outputDir}`);
}

void main();
