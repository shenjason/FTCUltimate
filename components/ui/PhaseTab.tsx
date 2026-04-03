// components/ui/PhaseTab.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface PhaseTabProps {
  activeTab: "auto" | "teleop";
  onTabChange: (tab: "auto" | "teleop") => void;
  autoScore: number;
  teleopScore: number;
}

export function PhaseTab({
  activeTab,
  onTabChange,
  autoScore,
  teleopScore,
}: PhaseTabProps) {
  return (
    <View className="flex-row mx-4 mb-3 bg-surface rounded-xl p-1 border border-outline-variant">
      <TouchableOpacity
        onPress={() => onTabChange("auto")}
        className={`flex-1 py-2 rounded-lg items-center ${
          activeTab === "auto" ? "bg-auto/15" : ""
        }`}
      >
        <Text
          className={`text-xs font-bold ${activeTab === "auto" ? "text-auto" : "text-on-surface-variant"}`}
        >
          AUTONOMOUS
        </Text>
        <Text
          className={`text-sm font-semibold mt-0.5 ${activeTab === "auto" ? "text-auto" : "text-on-surface-variant"}`}
        >
          {autoScore} pts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onTabChange("teleop")}
        className={`flex-1 py-2 rounded-lg items-center ${
          activeTab === "teleop" ? "bg-teleop/15" : ""
        }`}
      >
        <Text
          className={`text-xs font-bold ${activeTab === "teleop" ? "text-teleop" : "text-on-surface-variant"}`}
        >
          TELEOP
        </Text>
        <Text
          className={`text-sm font-semibold mt-0.5 ${activeTab === "teleop" ? "text-teleop" : "text-on-surface-variant"}`}
        >
          {teleopScore} pts
        </Text>
      </TouchableOpacity>
    </View>
  );
}
