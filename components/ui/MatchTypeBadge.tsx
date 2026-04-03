import React from "react";
import { View, Text } from "react-native";
import type { MatchType } from "../../types/match";

export function MatchTypeBadge({ matchType }: { matchType?: MatchType }) {
  const type = matchType ?? "solo";
  if (type === "timer_only") {
    return null;
  }
  if (type === "full") {
    return (
      <View className="bg-secondary-container border border-secondary px-2 py-0.5 rounded-full">
        <Text className="text-secondary text-[10px] font-bold tracking-wide">
          FULL
        </Text>
      </View>
    );
  }
  // solo (default) — neutral gray-blue
  return (
    <View className="bg-surface-container border border-surface-container-high px-2 py-0.5 rounded-full">
      <Text className="text-on-surface-variant text-[10px] font-bold tracking-wide">
        SOLO
      </Text>
    </View>
  );
}
