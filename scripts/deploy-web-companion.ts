import { access, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { WEB_OUTPUT_DIR } from "./web-config";

async function main() {
  const outputDir = path.resolve(WEB_OUTPUT_DIR);
  const remoteRoot = (process.env.FTP_REMOTE_ROOT ?? ".").replace(/^\/+|\/+$/g, "");
  const remoteDemoRoot = `${remoteRoot}/demos/mackaye-fieldbook`.replace(/^\//, "");
  const dryRun = process.argv.includes("--dry-run");
  const requiredEnv = ["FTP_HOST", "FTP_USER", "FTP_PASSWORD"];
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);

  await access(path.join(outputDir, "index.html"));
  await access(path.join(outputDir, ".htaccess"));
  const files = await walk(outputDir);

  console.log("MacKaye Fieldbook focused FTP deployment");
  console.log(`Local folder: ${outputDir}`);
  console.log(`Remote folder: ${remoteDemoRoot}`);
  console.log(`Files: ${files.length}`);
  for (const file of files) {
    console.log(
      `- ${path.relative(outputDir, file)} -> ${remoteDemoRoot}/${path.relative(outputDir, file).replaceAll("\\", "/")}`,
    );
  }

  if (dryRun) {
    console.log("Dry run only. No files uploaded.");
    process.exit(0);
  }

  if (missingEnv.length) {
    console.error(`Upload not started. Missing environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
  }

  const protocol = process.env.FTP_PROTOCOL ?? "ftp";
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "mackaye-fieldbook-ftp-"));
  const configPath = path.join(tempDir, "curl-config.txt");

  try {
    for (const file of files) {
      const relative = path.relative(outputDir, file).replaceAll("\\", "/");
      const remoteFile = `${remoteDemoRoot}/${relative}`;
      const config = [
        "fail",
        "show-error",
        "silent",
        "ftp-create-dirs",
        `user = "${process.env.FTP_USER}:${process.env.FTP_PASSWORD}"`,
        `upload-file = "${file.replaceAll("\\", "\\\\")}"`,
        `url = "${protocol}://${process.env.FTP_HOST}/${remoteFile}"`,
      ].join("\n");
      await writeFile(configPath, config, "utf8");
      const result = spawnSync("curl.exe", ["--config", configPath], {
        stdio: ["ignore", "inherit", "inherit"],
      });
      if (result.status !== 0) throw new Error(`Upload failed for ${relative}`);
    }

    const listingConfig = [
      "fail",
      "show-error",
      "silent",
      "list-only",
      `user = "${process.env.FTP_USER}:${process.env.FTP_PASSWORD}"`,
      `url = "${protocol}://${process.env.FTP_HOST}/${remoteDemoRoot}/"`,
    ].join("\n");
    await writeFile(configPath, listingConfig, "utf8");
    const listing = spawnSync("curl.exe", ["--config", configPath], { encoding: "utf8" });
    if (listing.status !== 0) throw new Error("Remote listing failed after upload.");
    const remoteFiles = listing.stdout.split(/\r?\n/).filter(Boolean);
    console.log(`Remote root listing: ${remoteFiles.length} entries.`);
    console.log("FTP deployment completed.");
  } finally {
    const config = await readFile(configPath, "utf8").catch(() => "");
    if (config.includes(process.env.FTP_PASSWORD ?? "__missing__")) {
      await writeFile(configPath, "", "utf8");
    }
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    }),
  );
  return nested.flat();
}

void main();
