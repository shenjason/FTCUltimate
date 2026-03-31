// app/(tabs)/_layout.tsx
import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
const ScreenOrientation =
  Platform.OS !== "web" ? require("expo-screen-orientation") : null;
import { useMatchStore } from "../../lib/store";

// Issue 4: module-level const avoids inline object recreation on every render
const TAB_BAR_STYLE_VISIBLE = {
  backgroundColor: "#0A0F1E",
  borderTopColor: "#1E293B",
  borderTopWidth: 1,
} as const;

export default function TabLayout() {
  const matchStarted = useMatchStore((s) => s.matchStarted);
  const matchType = useMatchStore((s) => s.matchType);

  // Lock to portrait on mount as the baseline orientation.
  // Note: the match screen itself will call lockAsync(LANDSCAPE) when a match
  // starts and unlock/re-lock portrait when it ends — this layout only
  // establishes the default portrait lock.
  useEffect(() => {
    // Issue 1: handle promise rejection so unhandled rejections don't surface
    ScreenOrientation?.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    )?.catch((err: any) => {
      console.warn("[TabLayout] Failed to lock orientation to portrait:", err);
    });

    // Issue 3: release the lock if this layout ever unmounts
    return () => {
      ScreenOrientation?.unlockAsync()?.catch((err: any) => {
        console.warn(
          "[TabLayout] Failed to unlock orientation on unmount:",
          err,
        );
      });
    };
  }, []);

  // Issue 5: timer_only is excluded because that mode keeps portrait layout
  // with the tab bar visible; only solo and full matches go landscape/fullscreen
  const isLandscapeMatch =
    matchStarted && (matchType === "solo" || matchType === "full");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isLandscapeMatch
          ? { display: "none" }
          : TAB_BAR_STYLE_VISIBLE,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
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
          title: "Scouting",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
