import type { ActivitySnapshot, Direction, JournalEntry, Journey } from "@mackaye/domain";

export type StorageMode = "IndexedDB" | "Memory-only fallback";

interface OutboxRow {
  id: string;
  idempotencyKey: string;
  entityType: string;
  payload: string;
  status: "pending" | "synchronized";
  lastAttemptAt?: string;
  succeededAt?: string;
}

interface WebDatabaseState {
  journeys: Journey[];
  completedSections: Record<string, string[]>;
  journalEntries: JournalEntry[];
  settings: Record<string, unknown>;
  outbox: OutboxRow[];
}

const DATABASE_NAME = "mackaye-fieldbook-web";
const STORE_NAME = "state";
const STATE_KEY = "primary";
const emptyState = (): WebDatabaseState => ({
  journeys: [],
  completedSections: {},
  journalEntries: [],
  settings: {},
  outbox: [],
});

let memoryState = emptyState();
let activeStorageMode: StorageMode =
  typeof indexedDB === "undefined" ? "Memory-only fallback" : "IndexedDB";

export function getStorageMode(): StorageMode {
  return activeStorageMode;
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") {
    activeStorageMode = "Memory-only fallback";
    return null;
  }

  try {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    activeStorageMode = "Memory-only fallback";
    return null;
  }
}

async function readState(): Promise<WebDatabaseState> {
  const database = await openDatabase();
  if (!database) return structuredClone(memoryState);

  try {
    const value = await new Promise<WebDatabaseState | undefined>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
      request.onsuccess = () => resolve(request.result as WebDatabaseState | undefined);
      request.onerror = () => reject(request.error);
    });
    activeStorageMode = "IndexedDB";
    return value ?? emptyState();
  } catch {
    activeStorageMode = "Memory-only fallback";
    return structuredClone(memoryState);
  } finally {
    database.close();
  }
}

async function writeState(state: WebDatabaseState) {
  memoryState = structuredClone(state);
  const database = await openDatabase();
  if (!database) return;

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(state, STATE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    activeStorageMode = "IndexedDB";
  } catch {
    activeStorageMode = "Memory-only fallback";
  } finally {
    database.close();
  }
}

async function updateState(updater: (state: WebDatabaseState) => void) {
  const state = await readState();
  updater(state);
  await writeState(state);
}

export async function listJourneys(): Promise<Journey[]> {
  return (await readState()).journeys.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createJourney(input: {
  name: string;
  direction: Direction;
  startDate?: string;
  endDate?: string;
  manualMiles?: number;
}) {
  const now = new Date().toISOString();
  const id = `journey-${Date.now()}`;
  await updateState((state) => {
    state.journeys.push({
      id,
      name: input.name,
      direction: input.direction,
      startDate: input.startDate,
      endDate: input.endDate,
      manualMiles: input.manualMiles ?? 0,
      createdAt: now,
      updatedAt: now,
    });
    enqueue(state, "journey", id, { ...input, id, createdAt: now });
  });
  return id;
}

export async function deleteJourney(id: string) {
  await updateState((state) => {
    state.journeys = state.journeys.filter((journey) => journey.id !== id);
    state.journalEntries = state.journalEntries.filter((entry) => entry.journeyId !== id);
    delete state.completedSections[id];
  });
}

export async function updateJourney(
  id: string,
  input: {
    name: string;
    direction: Direction;
    startDate?: string;
    endDate?: string;
    manualMiles: number;
  },
) {
  await updateState((state) => {
    const journey = state.journeys.find((candidate) => candidate.id === id);
    if (!journey) return;
    Object.assign(journey, input, { updatedAt: new Date().toISOString() });
    enqueue(state, "journey", id, journey);
  });
}

export async function addJournalEntry(
  journeyId: string,
  body: string,
  privateNotes: string,
): Promise<JournalEntry> {
  const now = new Date().toISOString();
  const entry = {
    id: `entry-${Date.now()}`,
    journeyId,
    body,
    privateNotes,
    occurredAt: now,
    createdAt: now,
  };
  await updateState((state) => {
    state.journalEntries.push(entry);
    enqueue(state, "journal_entry", entry.id, entry);
  });
  return entry;
}

export async function listJournalEntries(journeyId?: string): Promise<JournalEntry[]> {
  return (await readState()).journalEntries
    .filter((entry) => !journeyId || entry.journeyId === journeyId)
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export async function updateJournalEntry(id: string, body: string, privateNotes: string) {
  await updateState((state) => {
    const entry = state.journalEntries.find((candidate) => candidate.id === id);
    if (!entry) return;
    entry.body = body;
    entry.privateNotes = privateNotes;
    enqueue(state, "journal_entry", id, entry);
  });
}

export async function deleteJournalEntry(id: string) {
  await updateState((state) => {
    state.journalEntries = state.journalEntries.filter((entry) => entry.id !== id);
  });
}

export async function setSectionComplete(journeyId: string, sectionId: string, complete: boolean) {
  await updateState((state) => {
    const completed = new Set(state.completedSections[journeyId] ?? []);
    if (complete) completed.add(sectionId);
    else completed.delete(sectionId);
    state.completedSections[journeyId] = [...completed];
  });
}

export async function listCompletedSections(journeyId: string): Promise<string[]> {
  return (await readState()).completedSections[journeyId] ?? [];
}

export async function saveSetting(key: string, value: unknown) {
  await updateState((state) => {
    state.settings[key] = value;
  });
}

export async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const value = (await readState()).settings[key];
  return value === undefined ? fallback : (value as T);
}

export async function persistActivity(snapshot: ActivitySnapshot) {
  await saveSetting("activity", snapshot);
}

export async function pendingOutboxCount() {
  return (await readState()).outbox.filter((row) => row.status === "pending").length;
}

export async function runMockOutboxSync() {
  let synchronized = 0;
  await updateState((state) => {
    const now = new Date().toISOString();
    for (const row of state.outbox) {
      if (row.status !== "pending") continue;
      row.status = "synchronized";
      row.lastAttemptAt = now;
      row.succeededAt = now;
      synchronized += 1;
    }
    state.settings.lastSyncAt = now;
  });
  return synchronized;
}

export async function exportAllLocalData() {
  const state = await readState();
  return {
    exportedAt: new Date().toISOString(),
    storageMode: getStorageMode(),
    journeys: state.journeys,
    journalEntries: state.journalEntries,
    completedSections: state.completedSections,
    settings: state.settings,
    outbox: state.outbox,
  };
}

export async function deleteAllLocalData() {
  memoryState = emptyState();
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(STATE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function resetWebDatabaseForTests() {
  memoryState = emptyState();
  if (typeof indexedDB === "undefined") return;
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

function enqueue(state: WebDatabaseState, entityType: string, entityId: string, payload: unknown) {
  const idempotencyKey = `${entityType}:${entityId}`;
  const existing = state.outbox.find((row) => row.idempotencyKey === idempotencyKey);
  if (existing) {
    existing.payload = JSON.stringify(payload);
    existing.status = "pending";
    return;
  }
  state.outbox.push({
    id: `outbox-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    idempotencyKey,
    entityType,
    payload: JSON.stringify(payload),
    status: "pending",
  });
}
