export const activityStates = [
  "GUIDE_ONLY",
  "TRACKING_LOCAL",
  "TRACKING_SYNC_PENDING",
  "TRACKING_AND_SYNCING",
  "ALL_ACTIVITY_PAUSED",
] as const;

export type ActivityState = (typeof activityStates)[number];
export type Direction = "northbound" | "southbound" | "mixed";
export type Difficulty = "easy" | "moderate" | "strenuous";
export type Confidence = "low" | "medium" | "high";
export type ContentStatus = "demo" | "draft" | "production";
export type SourceType = "fictional-demo" | "official" | "personal" | "community" | "inferred";
export type PoiType = "water" | "camping" | "history" | "caution" | "view" | "access";
export type BatteryMode = "GUIDE_ONLY" | "BATTERY_SAVER" | "BALANCED" | "HIGH_ACCURACY";
export type SyncPolicy =
  | "MANUAL_ONLY"
  | "APP_OPEN_WIFI"
  | "HIKE_END"
  | "WIFI_CHARGING"
  | "ANY_CONNECTION";

export interface Verification {
  sourceType: SourceType;
  sourceCitation: string;
  verifiedAt: string;
  verifiedBy: string;
  confidence: Confidence;
  contentStatus: ContentStatus;
}

export interface TrailSection extends Verification {
  id: string;
  slug: string;
  title: string;
  region: string;
  order: number;
  startLabel: string;
  endLabel: string;
  approximateMiles: number;
  northboundSummary: string;
  southboundSummary: string;
  difficulty: Difficulty;
  elevationNotes: string;
  waterNotes: string;
  campingNotes: string;
  seasonalNotes: string;
  navigationCautions: string;
  historicalNotes: string;
  fieldNotes: string;
}

export interface PointOfInterest extends Verification {
  id: string;
  sectionId: string;
  type: PoiType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  mileMarker: number;
  directionNotes: string;
  demoCoordinates: true;
}

export interface Journey {
  id: string;
  name: string;
  direction: Direction;
  startDate?: string;
  endDate?: string;
  manualMiles: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  journeyId: string;
  body: string;
  privateNotes: string;
  occurredAt: string;
  createdAt: string;
}

export interface ActivitySnapshot {
  state: ActivityState;
  previousState: ActivityState | null;
  pausedAt: string | null;
  gpsActive: boolean;
  backgroundTasksActive: boolean;
  networkEnabled: boolean;
  syncActive: boolean;
  uploadsActive: boolean;
}

export const batteryProfiles: Record<
  BatteryMode,
  {
    accuracy: string;
    distanceIntervalMeters: number | null;
    timeIntervalMs: number | null;
    background: false;
    impact: string;
  }
> = {
  GUIDE_ONLY: {
    accuracy: "none",
    distanceIntervalMeters: null,
    timeIntervalMs: null,
    background: false,
    impact: "Lowest — no GPS tracking",
  },
  BATTERY_SAVER: {
    accuracy: "balanced",
    distanceIntervalMeters: 100,
    timeIntervalMs: 120000,
    background: false,
    impact: "Low",
  },
  BALANCED: {
    accuracy: "high",
    distanceIntervalMeters: 40,
    timeIntervalMs: 60000,
    background: false,
    impact: "Moderate",
  },
  HIGH_ACCURACY: {
    accuracy: "highest",
    distanceIntervalMeters: 10,
    timeIntervalMs: 15000,
    background: false,
    impact: "High — use only when needed",
  },
};
