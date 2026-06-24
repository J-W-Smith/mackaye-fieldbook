import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { ActivitySnapshot, BatteryMode, SyncPolicy } from "@mackaye/domain";
import {
  ActivityGate,
  safeRestartState,
  snapshotFor,
  stopTrackingAndSync,
} from "@mackaye/sync-core";
import {
  getStorageMode,
  pendingOutboxCount,
  persistActivity,
  readSetting,
  runMockOutboxSync,
  saveSetting,
} from "@/db/database";
import { ExpoForegroundTrackingService } from "@/services/tracking";

interface AppContextValue {
  ready: boolean;
  activity: ActivitySnapshot;
  batteryMode: BatteryMode;
  syncPolicy: SyncPolicy;
  networkMasterEnabled: boolean;
  pendingChanges: number;
  lastSyncAt: string | null;
  storageMode: string;
  startHike(): Promise<void>;
  startSimulation(): Promise<void>;
  stopAllActivity(): Promise<void>;
  resumeHike(): Promise<void>;
  setBatteryMode(mode: BatteryMode): Promise<void>;
  setSyncPolicy(policy: SyncPolicy): Promise<void>;
  setNetworkMasterEnabled(enabled: boolean): Promise<void>;
  syncNow(): Promise<number>;
  refreshDiagnostics(): Promise<void>;
}

const initialActivity = snapshotFor("GUIDE_ONLY", null);
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const gate = useRef(new ActivityGate());
  const tracking = useRef(new ExpoForegroundTrackingService());
  const [ready, setReady] = useState(false);
  const [activity, setActivity] = useState(initialActivity);
  const [batteryModeState, setBatteryModeState] = useState<BatteryMode>("BALANCED");
  const [syncPolicyState, setSyncPolicyState] = useState<SyncPolicy>("MANUAL_ONLY");
  const [networkMasterEnabled, setNetworkEnabledState] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState(getStorageMode());

  const refreshDiagnostics = useCallback(async () => {
    setPendingChanges(await pendingOutboxCount());
    setLastSyncAt(await readSetting<string | null>("lastSyncAt", null));
    setStorageMode(getStorageMode());
  }, []);

  useEffect(() => {
    void (async () => {
      const savedActivity = await readSetting<ActivitySnapshot>("activity", initialActivity);
      const savedBatteryMode = await readSetting<BatteryMode>("batteryMode", "BALANCED");
      const savedSyncPolicy = await readSetting<SyncPolicy>("syncPolicy", "MANUAL_ONLY");
      const savedNetwork = await readSetting("networkMasterEnabled", true);
      tracking.current.setMode(savedBatteryMode);
      setBatteryModeState(savedBatteryMode);
      setSyncPolicyState(savedSyncPolicy);
      setNetworkEnabledState(savedNetwork);

      const restartState = safeRestartState(savedActivity.state);
      let safeSnapshot = gate.current.transition(restartState);
      safeSnapshot = gate.current.setNetworkEnabled(
        restartState !== "ALL_ACTIVITY_PAUSED" && savedNetwork,
      );
      setActivity(safeSnapshot);
      await persistActivity(safeSnapshot);
      await refreshDiagnostics();
      setReady(true);
    })();
  }, [refreshDiagnostics]);

  const startHike = useCallback(async () => {
    tracking.current.setMode(batteryModeState);
    await tracking.current.start();
    let snapshot = gate.current.transition("TRACKING_LOCAL");
    snapshot = gate.current.setNetworkEnabled(networkMasterEnabled);
    setActivity(snapshot);
    await persistActivity(snapshot);
  }, [batteryModeState, networkMasterEnabled]);

  const startSimulation = useCallback(async () => {
    tracking.current.setMode(batteryModeState);
    await tracking.current.startSimulation();
    let snapshot = gate.current.transition("TRACKING_LOCAL");
    snapshot = gate.current.setNetworkEnabled(networkMasterEnabled);
    setActivity(snapshot);
    await persistActivity(snapshot);
  }, [batteryModeState, networkMasterEnabled]);

  const stopAllActivity = useCallback(async () => {
    const snapshot = await stopTrackingAndSync(gate.current, tracking.current);
    setActivity(snapshot);
    await persistActivity(snapshot);
  }, []);

  const resumeHike = useCallback(async () => {
    await tracking.current.resume();
    const resumeState =
      activity.previousState && activity.previousState !== "ALL_ACTIVITY_PAUSED"
        ? activity.previousState
        : "TRACKING_LOCAL";
    let snapshot = gate.current.transition(resumeState);
    snapshot = gate.current.setNetworkEnabled(networkMasterEnabled);
    setActivity(snapshot);
    await persistActivity(snapshot);
  }, [activity.previousState, networkMasterEnabled]);

  const setBatteryMode = useCallback(async (mode: BatteryMode) => {
    setBatteryModeState(mode);
    tracking.current.setMode(mode);
    await saveSetting("batteryMode", mode);
  }, []);

  const setSyncPolicy = useCallback(async (policy: SyncPolicy) => {
    setSyncPolicyState(policy);
    await saveSetting("syncPolicy", policy);
  }, []);

  const setNetworkMasterEnabled = useCallback(async (enabled: boolean) => {
    setNetworkEnabledState(enabled);
    const snapshot = gate.current.setNetworkEnabled(enabled);
    setActivity(snapshot);
    await saveSetting("networkMasterEnabled", enabled);
    await persistActivity(snapshot);
  }, []);

  const syncNow = useCallback(async () => {
    if (syncPolicyState !== "MANUAL_ONLY") {
      throw new Error("Only Manual Only sync is enabled in this prototype.");
    }
    gate.current.assertNetworkAllowed();
    const count = await runMockOutboxSync();
    await refreshDiagnostics();
    return count;
  }, [refreshDiagnostics, syncPolicyState]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      activity,
      batteryMode: batteryModeState,
      syncPolicy: syncPolicyState,
      networkMasterEnabled,
      pendingChanges,
      lastSyncAt,
      storageMode,
      startHike,
      startSimulation,
      stopAllActivity,
      resumeHike,
      setBatteryMode,
      setSyncPolicy,
      setNetworkMasterEnabled,
      syncNow,
      refreshDiagnostics,
    }),
    [
      activity,
      batteryModeState,
      lastSyncAt,
      networkMasterEnabled,
      pendingChanges,
      ready,
      refreshDiagnostics,
      resumeHike,
      setBatteryMode,
      setNetworkMasterEnabled,
      setSyncPolicy,
      startHike,
      startSimulation,
      stopAllActivity,
      storageMode,
      syncNow,
      syncPolicyState,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider.");
  return context;
}
