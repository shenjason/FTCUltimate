// app/(tabs)/_layout.tsx
import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
const ScreenOrientation =
  Platform.OS !== "web" ? require("expo-screen-orientation") : null;
import { useMatchStore } from "../../lib/store";
import THEME from "../../lib/theme";

const TAB_BAR_STYLE_VISIBLE = {
  backgroundColor: THEME.colors.background,
  borderTopColor: THEME.colors.tabBarBorder,
  borderTopWidth: 1,
  height: 64,
} as const;

const TAB_ITEM_STYLE = {
  borderRadius: 12,
  marginHorizontal: 4,
  marginVertical: 4,
} as const;

export default function TabLayout() {
  const matchStarted = useMatchStore((s) => s.matchStarted);
  const matchType = useMatchStore((s) => s.matchType);

  useEffect(() => {
    ScreenOrientation?.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    )?.catch((err: any) => {
      console.warn("[TabLayout] Failed to lock orientation to portrait:", err);
    });

    return () => {
      ScreenOrientation?.unlockAsync()?.catch((err: any) => {
        console.warn(
          "[TabLayout] Failed to unlock orientation on unmount:",
          err,
        );
      });
    };
  }, []);

  const isLandscapeMatch =
    matchStarted &&
    (matchType === "solo" ||
      matchType === "full" ||
      matchType === "timer_only");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isLandscapeMatch
          ? { display: "none" }
          : TAB_BAR_STYLE_VISIBLE,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: "rgba(232,234,247,0.5)",
        tabBarActiveBackgroundColor: THEME.colors.tabBarActiveBg,
        tabBarItemStyle: TAB_ITEM_STYLE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="match/index"
        options={{
          title: "Match",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history/index"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scouting/index"
        options={{
          title: "Scout",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
