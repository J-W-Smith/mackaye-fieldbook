import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Button, Card, Heading, Muted, Screen } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { usePalette } from "@/theme";

export default function ActiveHikeScreen() {
  const colors = usePalette();
  const { activity, batteryMode, startHike, stopAllActivity, resumeHike } = useApp();
  const [undoVisible, setUndoVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!undoVisible) return;
    const timeout = setTimeout(() => setUndoVisible(false), 8000);
    return () => clearTimeout(timeout);
  }, [undoVisible]);

  async function stop() {
    setUndoVisible(true);
    setMessage(null);
    await stopAllActivity();
  }

  async function start() {
    try {
      setMessage(null);
      await startHike();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start tracking.");
    }
  }

  async function resume() {
    try {
      setMessage(null);
      setUndoVisible(false);
      await resumeHike();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resume tracking.");
    }
  }

  const paused = activity.state === "ALL_ACTIVITY_PAUSED";
  return (
    <Screen>
      <Heading>Active Hike</Heading>
      <Card>
        <Text style={[styles.state, { color: colors.text }]}>State: {activity.state}</Text>
        <Muted>Battery mode: {batteryMode}</Muted>
        <Muted>Foreground GPS: {activity.gpsActive ? "ACTIVE" : "OFF"}</Muted>
        <Muted>Network gate: {activity.networkEnabled ? "OPEN" : "BLOCKED"}</Muted>
        <Muted>Sync: {activity.syncActive ? "ACTIVE" : "OFF"}</Muted>
        <Muted>Uploads: {activity.uploadsActive ? "ACTIVE" : "OFF"}</Muted>
      </Card>
      {activity.state === "GUIDE_ONLY" && (
        <Button
          title="START LOCAL HIKE"
          onPress={() => void start()}
          accessibilityHint="Requests foreground location permission and starts local tracking"
        />
      )}
      {!paused && activity.state !== "GUIDE_ONLY" && (
        <Button
          title="STOP TRACKING & SYNC"
          tone="danger"
          onPress={() => void stop()}
          accessibilityLabel="Stop Tracking and Sync"
          accessibilityHint="Immediately stops location, network, synchronization, and uploads"
          style={styles.stop}
        />
      )}
      {paused && (
        <>
          <Card>
            <Text style={[styles.state, { color: colors.danger }]}>ALL ACTIVITY PAUSED</Text>
            <Muted>
              The offline guide and journal remain available. The app will never resume
              automatically.
            </Muted>
            {activity.pausedAt && (
              <Muted>Paused at {new Date(activity.pausedAt).toLocaleString()}</Muted>
            )}
          </Card>
          {undoVisible && <Button title="UNDO" tone="neutral" onPress={() => void resume()} />}
          <Button
            title="RESUME HIKE"
            tone="success"
            onPress={() => void resume()}
            accessibilityHint="Explicitly resumes foreground tracking"
            style={styles.resume}
          />
        </>
      )}
      {message && <Text style={{ color: colors.danger, fontSize: 17 }}>{message}</Text>}
      <Muted>
        Background tracking is disabled in this phase. Starting a hike is the only action that
        requests location permission.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  state: { fontSize: 20, fontWeight: "900" },
  stop: { minHeight: 86 },
  resume: { minHeight: 72 },
});
