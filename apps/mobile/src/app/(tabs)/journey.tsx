import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import type { Direction, JournalEntry, Journey } from "@mackaye/domain";
import {
  addJournalEntry,
  createJourney,
  deleteJournalEntry,
  deleteJourney,
  listCompletedSections,
  listJournalEntries,
  listJourneys,
  setSectionComplete,
  updateJournalEntry,
  updateJourney,
} from "@/db/database";
import { demoContent } from "@/data/content";
import { Body, Button, Card, Field, Heading, Muted, Screen } from "@/components/ui";
import { usePalette } from "@/theme";
import { useApp } from "@/context/app-context";

export default function JourneyScreen() {
  const colors = usePalette();
  const { refreshDiagnostics } = useApp();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [name, setName] = useState("");
  const [direction, setDirection] = useState<Direction>("northbound");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [manualMiles, setManualMiles] = useState("0");
  const [entry, setEntry] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const selected = journeys[0];

  const refresh = useCallback(async () => {
    const next = await listJourneys();
    setJourneys(next);
    setCompleted(next[0] ? await listCompletedSections(next[0].id) : []);
    setEntries(next[0] ? await listJournalEntries(next[0].id) : []);
    await refreshDiagnostics();
  }, [refreshDiagnostics]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate() {
    if (!name.trim()) return;
    await createJourney({
      name: name.trim(),
      direction,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      manualMiles: Number(manualMiles) || 0,
    });
    setName("");
    setStartDate("");
    setEndDate("");
    setManualMiles("0");
    await refresh();
  }

  async function handleAddEntry() {
    if (!selected || !entry.trim()) return;
    if (editingEntryId) {
      await updateJournalEntry(editingEntryId, entry.trim(), privateNotes.trim());
    } else {
      await addJournalEntry(selected.id, entry.trim(), privateNotes.trim());
    }
    setEntry("");
    setPrivateNotes("");
    setEditingEntryId(null);
    await refresh();
  }

  return (
    <Screen>
      <Heading>Journey journal</Heading>
      <Muted>Journeys, completion, entries, and private notes are stored locally in SQLite.</Muted>
      <Card>
        <Text style={[styles.subheading, { color: colors.text }]}>Create a journey</Text>
        <Field
          accessibilityLabel="Journey name"
          placeholder="Journey name"
          value={name}
          onChangeText={setName}
        />
        <Field
          accessibilityLabel="Optional start date"
          placeholder="Start date (YYYY-MM-DD, optional)"
          value={startDate}
          onChangeText={setStartDate}
        />
        <Field
          accessibilityLabel="Optional end date"
          placeholder="End date (YYYY-MM-DD, optional)"
          value={endDate}
          onChangeText={setEndDate}
        />
        <Field
          accessibilityLabel="Manual mileage"
          placeholder="Manual mileage"
          keyboardType="decimal-pad"
          value={manualMiles}
          onChangeText={setManualMiles}
        />
        <View style={styles.row}>
          {(["northbound", "southbound", "mixed"] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: direction === value }}
              onPress={() => setDirection(value)}
              style={[
                styles.choice,
                {
                  borderColor: colors.border,
                  backgroundColor: direction === value ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text style={{ color: direction === value ? "#fff" : colors.text }}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <Button title="CREATE LOCAL JOURNEY" onPress={() => void handleCreate()} />
      </Card>
      {!selected && <Muted>No journeys yet. Guide access remains fully available.</Muted>}
      {selected && (
        <>
          <Card>
            <Text style={[styles.subheading, { color: colors.text }]}>{selected.name}</Text>
            <Muted>
              {selected.direction} · {selected.manualMiles} manual miles · {completed.length}/
              {demoContent.sections.length} demo sections
            </Muted>
            <Button
              title="LOAD FOR EDITING"
              tone="neutral"
              onPress={() => {
                setName(selected.name);
                setDirection(selected.direction);
                setStartDate(selected.startDate ?? "");
                setEndDate(selected.endDate ?? "");
                setManualMiles(String(selected.manualMiles));
              }}
            />
            <Button
              title="SAVE JOURNEY CHANGES"
              onPress={() =>
                void updateJourney(selected.id, {
                  name: name.trim() || selected.name,
                  direction,
                  startDate: startDate || undefined,
                  endDate: endDate || undefined,
                  manualMiles: Number(manualMiles) || 0,
                }).then(refresh)
              }
            />
            <Button
              title="DELETE JOURNEY"
              tone="danger"
              onPress={() =>
                Alert.alert("Delete this journey?", "This removes its local journal entries.", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => void deleteJourney(selected.id).then(refresh),
                  },
                ])
              }
            />
          </Card>
          <Heading>Demo completion</Heading>
          {demoContent.sections.map((section) => {
            const isComplete = completed.includes(section.id);
            return (
              <Pressable
                key={section.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isComplete }}
                onPress={() =>
                  void setSectionComplete(selected.id, section.id, !isComplete).then(refresh)
                }
              >
                <Card>
                  <Body>
                    {isComplete ? "☑" : "☐"} {section.title}
                  </Body>
                </Card>
              </Pressable>
            );
          })}
          <Heading>New journal entry</Heading>
          <Field
            accessibilityLabel="Journal entry"
            placeholder="What do you want to remember?"
            multiline
            value={entry}
            onChangeText={setEntry}
          />
          <Field
            accessibilityLabel="Private notes"
            placeholder="Private notes"
            multiline
            value={privateNotes}
            onChangeText={setPrivateNotes}
          />
          <Button
            title={editingEntryId ? "SAVE ENTRY CHANGES" : "SAVE LOCALLY"}
            onPress={() => void handleAddEntry()}
          />
          {entries.map((savedEntry) => (
            <Card key={savedEntry.id}>
              <Body>{savedEntry.body}</Body>
              <Muted>Private notes: {savedEntry.privateNotes || "None"}</Muted>
              <Button
                title="EDIT ENTRY"
                tone="neutral"
                onPress={() => {
                  setEditingEntryId(savedEntry.id);
                  setEntry(savedEntry.body);
                  setPrivateNotes(savedEntry.privateNotes);
                }}
              />
              <Button
                title="DELETE ENTRY"
                tone="danger"
                onPress={() => void deleteJournalEntry(savedEntry.id).then(refresh)}
              />
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subheading: { fontSize: 19, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
});
