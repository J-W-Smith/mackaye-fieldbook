import type { PropsWithChildren } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
} from "react-native";
import { usePalette } from "@/theme";

export function Screen({ children }: PropsWithChildren) {
  const colors = usePalette();
  return (
    <ScrollView
      nativeID="main-content"
      contentContainerStyle={[styles.screen, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function DemoBanner() {
  const colors = usePalette();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { borderColor: colors.warning, backgroundColor: colors.surface }]}
    >
      <Text style={[styles.bannerText, { color: colors.warning }]}>
        Demonstration content only — not for real-world navigation.
      </Text>
    </View>
  );
}

export function Heading({ children }: PropsWithChildren) {
  const colors = usePalette();
  return <Text style={[styles.heading, { color: colors.text }]}>{children}</Text>;
}

export function Body({ children }: PropsWithChildren) {
  const colors = usePalette();
  return <Text style={[styles.body, { color: colors.text }]}>{children}</Text>;
}

export function Muted({ children }: PropsWithChildren) {
  const colors = usePalette();
  return <Text style={[styles.body, { color: colors.muted }]}>{children}</Text>;
}

export function Card({ children }: PropsWithChildren) {
  const colors = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

export function Field(props: TextInputProps) {
  const colors = usePalette();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[
        styles.field,
        { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
        props.style,
      ]}
    />
  );
}

export function Button({
  title,
  tone = "primary",
  ...props
}: PressableProps & { title: string; tone?: "primary" | "danger" | "success" | "neutral" }) {
  const colors = usePalette();
  const backgroundColor =
    tone === "danger"
      ? colors.danger
      : tone === "success"
        ? colors.success
        : tone === "neutral"
          ? colors.muted
          : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [styles.button, { backgroundColor, opacity: pressed ? 0.78 : 1 }]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    padding: 18,
    gap: 14,
  },
  banner: { borderWidth: 2, borderRadius: 10, padding: 12 },
  bannerText: { fontSize: 15, fontWeight: "800", lineHeight: 21 },
  heading: { fontSize: 28, fontWeight: "800", lineHeight: 34 },
  body: { fontSize: 17, lineHeight: 25 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 8 },
  field: { minHeight: 52, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 17 },
  button: {
    minHeight: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonText: { color: "#ffffff", fontSize: 17, fontWeight: "800", textAlign: "center" },
});
