// components/ui/ScoreBadge.tsx
import React from "react";
import { View, Text } from "react-native";

interface ScoreBadgeProps {
  total: number;
  auto: number;
  teleop: number;
}

export function ScoreBadge({ total, auto, teleop }: ScoreBadgeProps) {
  return (
    <View className="items-center">
      <Text className="text-on-surface text-4xl font-bold">{total}</Text>
      <Text className="text-on-surface-variant text-xs mt-1">pts total</Text>
      <View className="flex-row gap-4 mt-1">
        <Text className="text-auto text-xs">AUTO {auto}</Text>
        <Text className="text-teleop text-xs">TELEOP {teleop}</Text>
      </View>
    </View>
  );
}
