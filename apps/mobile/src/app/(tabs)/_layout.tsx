import { Tabs } from "expo-router";
import { Text } from "react-native";
import { usePalette } from "@/theme";

const icons: Record<string, string> = {
  guide: "⌁",
  journey: "✎",
  active: "●",
  settings: "⚙",
  about: "i",
};

export default function TabsLayout() {
  const colors = usePalette();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, minHeight: 64 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color }) => (
          <Text accessibilityElementsHidden style={{ color, fontSize: 20, fontWeight: "800" }}>
            {icons[route.name] ?? "•"}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="guide" options={{ title: "Guide" }} />
      <Tabs.Screen name="journey" options={{ title: "Journey" }} />
      <Tabs.Screen name="active" options={{ title: "Active Hike" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="about" options={{ title: "About" }} />
    </Tabs>
  );
}
