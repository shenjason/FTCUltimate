import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { BounceButton } from "../../ui/AnimatedPressable";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
}

export default function GridFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance,
}: Props) {
  const cellValues = (value as Record<string, boolean>) ?? {};

  return (
    <View className="flex-1 flex-col gap-1 items-center justify-center">
      {Array.from({ length: (module as any).rows }).map((_, row) => (
        <View key={row} className="flex-row gap-1">
          {Array.from({ length: (module as any).cols }).map((_, col) => {
            const cellId = `${row}_${col}`;
            return (
              <BounceButton
                key={cellId}
                onPress={() =>
                  onChange({ ...cellValues, [cellId]: !cellValues[cellId] })
                }
                disabled={disabled}
                className={`w-9 h-9 rounded-lg ${cellValues[cellId] ? (alliance === "blue" ? "bg-primary" : alliance === "red" ? "bg-error" : "bg-surface-container-highest/40") : "bg-surface-container-highest/40 border border-outline-variant/10"}`}
              >
                <View />
              </BounceButton>
            );
          })}
        </View>
      ))}
    </View>
  );
}
