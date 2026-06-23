import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Difficulty, PoiType } from "@mackaye/domain";
import { demoContent } from "@/data/content";
import { Card, DemoBanner, Field, Heading, Muted, Screen } from "@/components/ui";
import { usePalette } from "@/theme";

const difficulties: (Difficulty | "all")[] = ["all", "easy", "moderate", "strenuous"];
const categories: (PoiType | "all")[] = [
  "all",
  "water",
  "camping",
  "history",
  "caution",
  "view",
  "access",
];

export default function GuideScreen() {
  const colors = usePalette();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [category, setCategory] = useState<PoiType | "all">("all");

  const sections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return demoContent.sections.filter((section) => {
      const matchesText =
        !normalized ||
        [
          section.title,
          section.region,
          section.northboundSummary,
          section.southboundSummary,
          section.waterNotes,
          section.campingNotes,
          section.historicalNotes,
        ].some((value) => value.toLowerCase().includes(normalized));
      const matchesDifficulty = difficulty === "all" || section.difficulty === difficulty;
      const matchesCategory =
        category === "all" ||
        demoContent.pointsOfInterest.some(
          (poi) => poi.sectionId === section.id && poi.type === category,
        );
      return matchesText && matchesDifficulty && matchesCategory;
    });
  }, [category, difficulty, query]);

  return (
    <Screen>
      <DemoBanner />
      <Heading>Offline guide</Heading>
      <Muted>
        Six fictional sections are bundled with the app and require no account or network.
      </Muted>
      <Field
        accessibilityLabel="Search guide"
        placeholder="Search sections, water, camping, history…"
        value={query}
        onChangeText={setQuery}
      />
      <FilterRow
        label="Difficulty"
        values={difficulties}
        selected={difficulty}
        onSelect={(value) => setDifficulty(value as Difficulty | "all")}
      />
      <FilterRow
        label="Category"
        values={categories}
        selected={category}
        onSelect={(value) => setCategory(value as PoiType | "all")}
      />
      {sections.map((section) => (
        <Link
          key={section.id}
          href={{ pathname: "/guide/[id]", params: { id: section.id } }}
          asChild
        >
          <Pressable accessibilityRole="button" accessibilityHint="Opens fictional section details">
            <Card>
              <Text style={[styles.title, { color: colors.text }]}>{section.title}</Text>
              <Muted>
                {section.region} · {section.approximateMiles} demo miles · {section.difficulty}
              </Muted>
              <View style={styles.badges}>
                <Badge label="DEMO" />
                <Badge label={`${section.confidence} confidence`} />
              </View>
            </Card>
          </Pressable>
        </Link>
      ))}
      {sections.length === 0 && <Muted>No fictional sections match the current filters.</Muted>}
    </Screen>
  );
}

function FilterRow({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: readonly string[];
  selected: string;
  onSelect(value: string): void;
}) {
  const colors = usePalette();
  return (
    <View style={styles.filterGroup}>
      <Text style={{ color: colors.text, fontWeight: "800" }}>{label}</Text>
      <View style={styles.filters}>
        {values.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: value === selected }}
            onPress={() => onSelect(value)}
            style={[
              styles.filter,
              {
                backgroundColor: value === selected ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: value === selected ? "#fff" : colors.text }}>{value}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  const colors = usePalette();
  return (
    <View style={[styles.badge, { borderColor: colors.accent }]}>
      <Text style={{ color: colors.text, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  filterGroup: { gap: 7 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  filter: {
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
});
