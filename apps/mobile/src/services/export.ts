import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { exportAllLocalData } from "@/db/database";

export async function exportLocalData() {
  const data = await exportAllLocalData();
  const uri = `${FileSystem.cacheDirectory}mackaye-fieldbook-export-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/json",
      dialogTitle: "Export MacKaye Fieldbook data",
    });
  }
  return uri;
}
