import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import type { BatteryMode, SyncPolicy } from "@mackaye/domain";
import { batteryProfiles } from "@mackaye/domain";
import { Button, Card, Heading, Muted, Screen } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { exportLocalData } from "@/services/export";
import { backgroundTrackingFeatureEnabled, trackingPlatformLabel } from "@/services/tracking";
import { deleteAllLocalData } from "@/db/database";
import { usePalette } from "@/theme";

const modes: BatteryMode[] = ["GUIDE_ONLY", "BATTERY_SAVER", "BALANCED", "HIGH_ACCURACY"];
const policies: SyncPolicy[] = [
  "MANUAL_ONLY",
  "APP_OPEN_WIFI",
  "HIKE_END",
  "WIFI_CHARGING",
  "ANY_CONNECTION",
];

export default function SettingsScreen() {
  const colors = usePalette();
  const app = useApp();
  const [permission, setPermission] = useState("undetermined");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then((result) => setPermission(result.status));
  }, [app.activity.gpsActive]);

  async function sync() {
    try {
      const count = await app.syncNow();
      setMessage(`Synchronized ${count} local mock outbox record(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sync was blocked.");
    }
  }

  return (
    <Screen>
      <Heading>Settings</Heading>
      <Card>
        <Text style={[styles.subheading, { color: colors.text }]}>Battery mode</Text>
        {modes.map((mode) => (
          <Button
            key={mode}
            title={`${mode}${app.batteryMode === mode ? " · SELECTED" : ""}`}
            tone={app.batteryMode === mode ? "primary" : "neutral"}
            onPress={() => void app.setBatteryMode(mode)}
          />
        ))}
        <Muted>{batteryProfiles[app.batteryMode].impact}</Muted>
        <Muted>
          {batteryProfiles[app.batteryMode].distanceIntervalMeters ?? "No"} meter distance interval
          · {batteryProfiles[app.batteryMode].timeIntervalMs ?? "No"} ms time interval · foreground
          only
        </Muted>
      </Card>
      <Card>
        <Text style={[styles.subheading, { color: colors.text }]}>Sync policy</Text>
        {policies.map((policy) => (
          <Button
            key={policy}
            title={`${policy}${policy !== "MANUAL_ONLY" ? " · FUTURE / DISABLED" : ""}`}
            tone={app.syncPolicy === policy ? "primary" : "neutral"}
            disabled={policy !== "MANUAL_ONLY"}
            onPress={() => void app.setSyncPolicy(policy)}
          />
        ))}
        <Button title="SYNC NOW" onPress={() => void sync()} />
      </Card>
      <Card>
        <View style={styles.switchRow}>
          <Text style={[styles.subheading, { color: colors.text }]}>
            Network activity master switch
          </Text>
          <Switch
            accessibilityLabel="Network activity master switch"
            value={app.networkMasterEnabled}
            onValueChange={(value) => void app.setNetworkMasterEnabled(value)}
          />
        </View>
      </Card>
      <Card>
        <Text style={[styles.subheading, { color: colors.text }]}>Diagnostic activity panel</Text>
        <Muted>Location permission: {permission}</Muted>
        <Muted>Local storage: {app.storageMode}</Muted>
        {app.storageMode === "Memory-only fallback" && (
          <Text style={{ color: colors.danger, fontSize: 17, fontWeight: "800" }}>
            Warning: this browser cannot use IndexedDB. Records will be lost when the page closes.
          </Text>
        )}
        <Muted>Tracking mode: {trackingPlatformLabel}</Muted>
        <Muted>GPS: {app.activity.gpsActive ? "ACTIVE" : "OFF"}</Muted>
        <Muted>
          Background tracking: {backgroundTrackingFeatureEnabled ? "ACTIVE" : "DISABLED"}
        </Muted>
        <Muted>Network: {app.activity.networkEnabled ? "ENABLED" : "BLOCKED"}</Muted>
        <Muted>Sync: {app.activity.syncActive ? "ACTIVE" : "OFF"}</Muted>
        <Muted>Uploads: {app.activity.uploadsActive ? "ACTIVE" : "OFF"}</Muted>
        <Muted>Pending local changes: {app.pendingChanges}</Muted>
        <Muted>Last sync: {app.lastSyncAt ?? "Never"}</Muted>
      </Card>
      <Button
        title="EXPORT LOCAL DATA AS JSON"
        onPress={() => void exportLocalData().then((uri) => setMessage(`Export created: ${uri}`))}
      />
      <Button
        title="DELETE ALL LOCAL DATA"
        tone="danger"
        onPress={() =>
          Alert.alert(
            "Delete all local data?",
            "This permanently removes journeys, notes, settings, and pending changes. Bundled demo guide content remains.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete everything",
                style: "destructive",
                onPress: () =>
                  void deleteAllLocalData().then(async () => {
                    await app.refreshDiagnostics();
                    setMessage("All local user data was deleted.");
                  }),
              },
            ],
          )
        }
      />
      {message && <Text style={{ color: colors.text, fontSize: 16 }}>{message}</Text>}
      <Muted>
        Privacy summary: trips, notes, timestamps, coordinates, and completion records remain local.
        No analytics or advertising SDKs are included.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subheading: { fontSize: 18, fontWeight: "800", flexShrink: 1 },
  switchRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
});
