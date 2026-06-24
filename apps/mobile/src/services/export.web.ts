import { exportAllLocalData } from "@/db/database";

export function createExportPayload(data: unknown) {
  const json = JSON.stringify(data, null, 2);
  JSON.parse(json);
  return json;
}

export function exportFilename(date = new Date()) {
  return `mackaye-fieldbook-export-${date.toISOString().slice(0, 10)}.json`;
}

export async function exportLocalData() {
  const json = createExportPayload(await exportAllLocalData());
  const filename = exportFilename();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return filename;
}
