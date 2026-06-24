import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { AppProvider } from "@/context/app-context";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      {Platform.OS === "web" && (
        <Link href="/guide" asChild>
          <Pressable accessibilityRole="link" style={styles.skipLink}>
            <Text style={styles.skipText}>Skip to interactive guide</Text>
          </Pressable>
        </Link>
      )}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="guide/[id]" options={{ title: "Section details" }} />
      </Stack>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  skipLink: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 1000,
    backgroundColor: "#17231a",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  skipText: { color: "#ffffff", fontWeight: "800" },
});
