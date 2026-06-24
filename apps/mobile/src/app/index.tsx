import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, Redirect } from "expo-router";
import { batteryProfiles } from "@mackaye/domain";
import { DemoBanner } from "@/components/ui";
import { usePalette } from "@/theme";

export default function IndexScreen() {
  const colors = usePalette();
  if (Platform.OS !== "web") return <Redirect href="/guide" />;
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL ?? "";

  return (
    <ScrollView
      nativeID="main-content"
      contentContainerStyle={[styles.page, { backgroundColor: colors.background }]}
    >
      <View style={styles.hero}>
        <Image
          source={{ uri: `${baseUrl}/icon-512.png` }}
          accessibilityLabel="MacKaye Fieldbook open book and mountain artwork"
          style={styles.artwork}
        />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>
            ANDROID · IPHONE · WEB PROTOTYPE
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>MacKaye Fieldbook</Text>
          <Text style={[styles.tagline, { color: colors.primary }]}>
            The trail guide that remembers your journey.
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>
            A local-first field-guide and private hiking-journal prototype. Browse an entirely
            fictional guide, explore browser-local journey records, and see how tracking, network,
            and sync activity remain under explicit user control.
          </Text>
          <Link href="/guide" asChild>
            <Pressable
              accessibilityRole="link"
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.ctaText}>OPEN INTERACTIVE DEMO</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <DemoBanner />
      <View
        style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.noticeTitle, { color: colors.text }]}>Independent and unofficial</Text>
        <Text style={[styles.body, { color: colors.text }]}>
          MacKaye Fieldbook is independent and is not affiliated with or endorsed by the Benton
          MacKaye Trail Association. It contains no official logos, copied guidebook text, real
          navigation data, or third-party map assets.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Offline-first by design</Text>
      <View style={styles.grid}>
        {[
          ["Guide without an account", "Bundled fictional content remains readable without login."],
          [
            "Private local records",
            "Journeys and journal entries stay in this browser’s IndexedDB.",
          ],
          [
            "No background presence",
            "No polling, heartbeat, WebSocket, analytics, or location upload loop.",
          ],
          [
            "Explicit activity control",
            "GPS and mock synchronization start only after a user action.",
          ],
        ].map(([title, description]) => (
          <View
            key={title}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.body, { color: colors.muted }]}>{description}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Battery concepts</Text>
      <View style={styles.grid}>
        {Object.entries(batteryProfiles).map(([mode, profile]) => (
          <View
            key={mode}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {mode.replaceAll("_", " ")}
            </Text>
            <Text style={[styles.body, { color: colors.muted }]}>{profile.impact}</Text>
            <Text style={[styles.small, { color: colors.muted }]}>
              Web tracking is foreground-only and may be throttled when the tab is inactive.
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.stopPanel, { borderColor: colors.danger }]}>
        <Text style={[styles.sectionTitle, { color: colors.danger }]}>STOP TRACKING & SYNC</Text>
        <Text style={[styles.body, { color: colors.text }]}>
          The large red control immediately clears browser geolocation watches, blocks network
          requests, suspends mock sync and uploads, and persists a paused state. Reloading never
          silently resumes activity; resume remains explicit.
        </Text>
      </View>

      <Text style={[styles.footer, { color: colors.muted }]}>
        Public preview only. No app-store release is claimed or available.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, gap: 28, alignItems: "center" },
  hero: {
    width: "100%",
    maxWidth: 1120,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    paddingVertical: 40,
  },
  artwork: { width: 320, height: 320, maxWidth: "100%", borderRadius: 36 },
  heroCopy: { flex: 1, minWidth: 280, maxWidth: 620, gap: 16 },
  eyebrow: { fontSize: 14, fontWeight: "900", letterSpacing: 1.2 },
  title: { fontSize: 52, lineHeight: 58, fontWeight: "900" },
  tagline: { fontSize: 25, lineHeight: 32, fontWeight: "800" },
  body: { fontSize: 18, lineHeight: 28 },
  small: { fontSize: 15, lineHeight: 22 },
  cta: {
    minHeight: 58,
    alignSelf: "flex-start",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "900" },
  notice: { width: "100%", maxWidth: 1120, borderWidth: 2, borderRadius: 16, padding: 22, gap: 8 },
  noticeTitle: { fontSize: 22, fontWeight: "900" },
  sectionTitle: { width: "100%", maxWidth: 1120, fontSize: 30, fontWeight: "900" },
  grid: {
    width: "100%",
    maxWidth: 1120,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: { flexGrow: 1, flexBasis: 240, borderWidth: 1, borderRadius: 16, padding: 20, gap: 8 },
  cardTitle: { fontSize: 20, fontWeight: "900" },
  stopPanel: {
    width: "100%",
    maxWidth: 1120,
    borderWidth: 4,
    borderRadius: 18,
    padding: 24,
    gap: 10,
  },
  footer: { fontSize: 15, paddingBottom: 30 },
});
