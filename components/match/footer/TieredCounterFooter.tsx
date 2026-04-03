import React from "react";
import { View, Text } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { BounceButton } from "../../ui/AnimatedPressable";
import { MaterialIcon } from "../../ui/MaterialIcon";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
}

export default function TieredCounterFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance,
}: Props) {
  const tierValues = (value as Record<string, number>) ?? {};
  return (
    <View className="flex-1 flex-row gap-3">
      {(module as any).tiers.map((tier: any) => {
        const tierCount = tierValues[tier.id] ?? 0;
        return (
          <View key={tier.id} className="flex-1 items-center gap-1">
            <Text className="text-[8px] uppercase font-bold text-on-surface-variant">
              {tier.label}
            </Text>
            <View className="flex-row gap-1.5 h-12 w-full">
              <BounceButton
                onPress={() =>
                  onChange({
                    ...tierValues,
                    [tier.id]: Math.max(0, tierCount - 1),
                  })
                }
                disabled={disabled || tierCount <= 0}
                className="flex-1 bg-surface-container-highest rounded-xl items-center justify-center"
              >
                <MaterialIcon name="remove" size={18} color={"#fff"} />
              </BounceButton>
              <View className="flex-1 items-center justify-center">
                <Text className="text-xl font-black text-on-surface">
                  {tierCount}
                </Text>
              </View>
              <BounceButton
                onPress={() =>
                  onChange({ ...tierValues, [tier.id]: tierCount + 1 })
                }
                disabled={disabled}
                className={`flex-1 ${alliance === "blue" ? "bg-primary" : alliance === "red" ? "bg-error" : "bg-surface-container-highest/40"} rounded-xl items-center justify-center`}
              >
                <MaterialIcon
                  name="add"
                  size={18}
                  color={
                    alliance === "blue"
                      ? "#fff"
                      : alliance === "red"
                        ? "#fff"
                        : "#fff"
                  }
                />
              </BounceButton>
            </View>
          </View>
        );
      })}
    </View>
  );
}
