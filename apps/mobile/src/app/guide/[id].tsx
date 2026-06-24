import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, DemoBanner, Heading, Muted, Screen } from "@/components/ui";
import { demoContent } from "@/data/content";
import { usePalette } from "@/theme";

export default function SectionDetailsScreen() {
  const colors = usePalette();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [northbound, setNorthbound] = useState(true);
  const section = demoContent.sections.find((candidate) => candidate.id === id);
  if (!section) {
    return (
      <Screen>
        <Heading>Section not found</Heading>
      </Screen>
    );
  }
  const points = demoContent.pointsOfInterest.filter((poi) => poi.sectionId === section.id);
  return (
    <Screen>
      <DemoBanner />
      <Heading>{section.title}</Heading>
      <Muted>
        {section.startLabel} → {section.endLabel} · {section.approximateMiles} fictional miles
      </Muted>
      <View style={styles.toggle}>
        <Button
          title="Northbound"
          tone={northbound ? "primary" : "neutral"}
          onPress={() => setNorthbound(true)}
          style={styles.toggleButton}
        />
        <Button
          title="Southbound"
          tone={!northbound ? "primary" : "neutral"}
          onPress={() => setNorthbound(false)}
          style={styles.toggleButton}
        />
      </View>
      <Card>
        <Text style={[styles.subheading, { color: colors.text }]}>Direction summary</Text>
        <Text style={[styles.body, { color: colors.text }]}>
          {northbound ? section.northboundSummary : section.southboundSummary}
        </Text>
      </Card>
      {[
        ["Elevation", section.elevationNotes],
        ["Water", section.waterNotes],
        ["Camping", section.campingNotes],
        ["Seasonal", section.seasonalNotes],
        ["Navigation cautions", section.navigationCautions],
        ["History", section.historicalNotes],
        ["Field notes", section.fieldNotes],
      ].map(([label, value]) => (
        <Card key={label}>
          <Text style={[styles.subheading, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.body, { color: colors.text }]}>{value}</Text>
        </Card>
      ))}
      <Heading>Demo points of interest</Heading>
      {points.map((poi) => (
        <Card key={poi.id}>
          <Text style={[styles.subheading, { color: colors.text }]}>
            {poi.type.toUpperCase()} · {poi.title}
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>{poi.description}</Text>
          <Muted>Coordinates intentionally fictional · mile {poi.mileMarker}</Muted>
        </Card>
      ))}
      <Muted>
        Provenance: {section.sourceCitation} · verified {section.verifiedAt} · {section.confidence}{" "}
        confidence
      </Muted>
    </Screen>
  );
}

export function generateStaticParams() {
  return demoContent.sections.map((section) => ({ id: section.id }));
}

const styles = StyleSheet.create({
  toggle: { flexDirection: "row", gap: 10 },
  toggleButton: { flex: 1 },
  subheading: { fontSize: 18, fontWeight: "800" },
  body: { fontSize: 17, lineHeight: 25 },
});
