import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useMatchStore } from "../../lib/store";

interface FoulsPanelProps {
  alliance: "blue" | "red";
  disabled?: boolean;
}

export function FoulsPanel({ alliance, disabled = false }: FoulsPanelProps) {
  const { fouls, incrementFoul, decrementFoul } = useMatchStore();

  const majorCount = alliance === "red" ? fouls.redMajor : fouls.blueMajor;
  const minorCount = alliance === "red" ? fouls.redMinor : fouls.blueMinor;

  return (
    <View className="flex-row gap-2 items-center justify-center">
      {/* Major Fouls */}
      <View className="items-center">
        <TouchableOpacity
          onPress={() => incrementFoul(alliance, "major")}
          disabled={disabled}
          className="bg-auto/30 border border-auto px-4 py-3 rounded-lg items-center"
        >
          <Text className="text-auto text-xs font-bold">!!!</Text>
          <Text className="text-auto text-xl font-bold">{majorCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => decrementFoul(alliance, "major")}
          disabled={disabled || majorCount <= 0}
          className="bg-surface px-4 py-1 rounded mt-1"
        >
          <Text className="text-text-primary">−</Text>
        </TouchableOpacity>
      </View>

      {/* Minor Fouls */}
      <View className="items-center">
        <TouchableOpacity
          onPress={() => incrementFoul(alliance, "minor")}
          disabled={disabled}
          className="bg-transition/30 border border-transition px-4 py-3 rounded-lg items-center"
        >
          <Text className="text-transition text-xs font-bold">!</Text>
          <Text className="text-transition text-xl font-bold">{minorCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => decrementFoul(alliance, "minor")}
          disabled={disabled || minorCount <= 0}
          className="bg-surface px-4 py-1 rounded mt-1"
        >
          <Text className="text-text-primary">−</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
