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
      <View className="bg-[#78350F] border border-[#D97706] px-2 py-0.5 rounded-full">
        <Text className="text-[#FCD34D] text-[10px] font-bold tracking-wide">
          FULL
        </Text>
      </View>
    );
  }
  // solo (default) — neutral gray-blue
  return (
    <View className="bg-[#1E293B] border border-[#334155] px-2 py-0.5 rounded-full">
      <Text className="text-[#94A3B8] text-[10px] font-bold tracking-wide">
        SOLO
      </Text>
    </View>
  );
}
