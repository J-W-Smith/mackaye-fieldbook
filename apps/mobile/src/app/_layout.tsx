import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "@/context/app-context";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="guide/[id]" options={{ title: "Section details" }} />
      </Stack>
    </AppProvider>
  );
}
