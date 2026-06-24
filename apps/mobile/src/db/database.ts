import * as SQLite from "expo-sqlite";
import type { ActivitySnapshot, Direction, JournalEntry, Journey } from "@mackaye/domain";

export type StorageMode = "SQLite";

export function getStorageMode(): StorageMode {
  return "SQLite";
}

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync("mackaye-fieldbook.db");
  const database = await databasePromise;
  await migrate(database);
  return database;
}

async function migrate(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS journeys (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      direction TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      manual_miles REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS journey_sections (
      journey_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      PRIMARY KEY (journey_id, section_id),
      FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      journey_id TEXT NOT NULL,
      body TEXT NOT NULL,
      private_notes TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY NOT NULL,
      idempotency_key TEXT UNIQUE NOT NULL,
      entity_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      last_attempt_at TEXT,
      succeeded_at TEXT,
      failed_at TEXT,
      error TEXT
    );
  `);
}

export async function listJourneys(): Promise<Journey[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>("SELECT * FROM journeys ORDER BY updated_at DESC");
  return rows.map(mapJourney);
}

export async function createJourney(input: {
  name: string;
  direction: Direction;
  startDate?: string;
  endDate?: string;
  manualMiles?: number;
}) {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const id = `journey-${Date.now()}`;
  await database.runAsync(
    `INSERT INTO journeys
      (id, name, direction, start_date, end_date, manual_miles, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.name,
    input.direction,
    input.startDate ?? null,
    input.endDate ?? null,
    input.manualMiles ?? 0,
    now,
    now,
  );
  await enqueue("journey", id, { ...input, id, createdAt: now });
  return id;
}

export async function deleteJourney(id: string) {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM journeys WHERE id = ?", id);
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
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE journeys
     SET name = ?, direction = ?, start_date = ?, end_date = ?, manual_miles = ?, updated_at = ?
     WHERE id = ?`,
    input.name,
    input.direction,
    input.startDate || null,
    input.endDate || null,
    input.manualMiles,
    now,
    id,
  );
  await enqueue("journey", id, { ...input, id, updatedAt: now });
}

export async function addJournalEntry(
  journeyId: string,
  body: string,
  privateNotes: string,
): Promise<JournalEntry> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const entry = {
    id: `entry-${Date.now()}`,
    journeyId,
    body,
    privateNotes,
    occurredAt: now,
    createdAt: now,
  };
  await database.runAsync(
    `INSERT INTO journal_entries
      (id, journey_id, body, private_notes, occurred_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    entry.id,
    journeyId,
    body,
    privateNotes,
    now,
    now,
  );
  await enqueue("journal_entry", entry.id, entry);
  return entry;
}

export async function listJournalEntries(journeyId?: string): Promise<JournalEntry[]> {
  const database = await getDatabase();
  const rows = journeyId
    ? await database.getAllAsync<any>(
        "SELECT * FROM journal_entries WHERE journey_id = ? ORDER BY occurred_at DESC",
        journeyId,
      )
    : await database.getAllAsync<any>("SELECT * FROM journal_entries ORDER BY occurred_at DESC");
  return rows.map((row) => ({
    id: row.id,
    journeyId: row.journey_id,
    body: row.body,
    privateNotes: row.private_notes,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  }));
}

export async function updateJournalEntry(id: string, body: string, privateNotes: string) {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE journal_entries SET body = ?, private_notes = ? WHERE id = ?",
    body,
    privateNotes,
    id,
  );
  await enqueue("journal_entry", id, { id, body, privateNotes });
}

export async function deleteJournalEntry(id: string) {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM journal_entries WHERE id = ?", id);
}

export async function setSectionComplete(journeyId: string, sectionId: string, complete: boolean) {
  const database = await getDatabase();
  if (complete) {
    await database.runAsync(
      "INSERT OR REPLACE INTO journey_sections (journey_id, section_id, completed_at) VALUES (?, ?, ?)",
      journeyId,
      sectionId,
      new Date().toISOString(),
    );
  } else {
    await database.runAsync(
      "DELETE FROM journey_sections WHERE journey_id = ? AND section_id = ?",
      journeyId,
      sectionId,
    );
  }
}

export async function listCompletedSections(journeyId: string): Promise<string[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ section_id: string }>(
    "SELECT section_id FROM journey_sections WHERE journey_id = ?",
    journeyId,
  );
  return rows.map((row) => row.section_id);
}

export async function saveSetting(key: string, value: unknown) {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
    key,
    JSON.stringify(value),
  );
}

export async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ?",
    key,
  );
  return row ? (JSON.parse(row.value) as T) : fallback;
}

export async function persistActivity(snapshot: ActivitySnapshot) {
  await saveSetting("activity", snapshot);
}

export async function pendingOutboxCount() {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM outbox WHERE status = 'pending'",
  );
  return row?.count ?? 0;
}

export async function runMockOutboxSync() {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ id: string }>(
    "SELECT id FROM outbox WHERE status = 'pending'",
  );
  const now = new Date().toISOString();
  await database.runAsync(
    "UPDATE outbox SET status = 'synchronized', last_attempt_at = ?, succeeded_at = ?, error = NULL WHERE status = 'pending'",
    now,
    now,
  );
  await saveSetting("lastSyncAt", now);
  return rows.length;
}

export async function exportAllLocalData() {
  const database = await getDatabase();
  return {
    exportedAt: new Date().toISOString(),
    journeys: await listJourneys(),
    journalEntries: await listJournalEntries(),
    completedSections: await database.getAllAsync("SELECT * FROM journey_sections"),
    settings: await database.getAllAsync("SELECT key, value FROM app_settings"),
    outbox: await database.getAllAsync("SELECT * FROM outbox"),
  };
}

export async function deleteAllLocalData() {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM journal_entries;
    DELETE FROM journey_sections;
    DELETE FROM journeys;
    DELETE FROM outbox;
    DELETE FROM app_settings;
  `);
}

async function enqueue(entityType: string, entityId: string, payload: unknown) {
  const database = await getDatabase();
  const id = `outbox-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await database.runAsync(
    "INSERT INTO outbox (id, idempotency_key, entity_type, payload) VALUES (?, ?, ?, ?)",
    id,
    `${entityType}:${entityId}`,
    entityType,
    JSON.stringify(payload),
  );
}

function mapJourney(row: any): Journey {
  return {
    id: row.id,
    name: row.name,
    direction: row.direction,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    manualMiles: row.manual_miles,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
