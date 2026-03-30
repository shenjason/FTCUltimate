// app/(tabs)/scouting/index.tsx
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ScoutingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F] items-center justify-center">
      <Ionicons name="search" size={64} color="#2A2A2A" />
      <Text className="text-[#9CA3AF] text-lg font-semibold mt-4">
        Scouting coming soon
      </Text>
    </SafeAreaView>
  );
}
