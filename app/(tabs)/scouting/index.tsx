// app/(tabs)/scouting/index.tsx
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import THEME from "../../../lib/theme";

export default function ScoutingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface-dim items-center justify-center">
      <Ionicons name="search" size={64} color={THEME.colors.border} />
      <Text className="text-on-surface-variant text-lg font-semibold mt-4">
        Scouting coming soon
      </Text>
    </SafeAreaView>
  );
}
