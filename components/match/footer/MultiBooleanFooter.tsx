import React from "react";
import { View, Text } from "react-native";
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

export default function MultiBooleanFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance,
}: Props) {
  const itemValues = (value as Record<string, boolean>) ?? {};
  const accentBg =
    alliance === "blue"
      ? "bg-primary"
      : alliance === "red"
        ? "bg-error"
        : "bg-surface-container-highest/40";
  const accentText =
    alliance === "blue"
      ? "text-on-primary"
      : alliance === "red"
        ? "text-on-error"
        : "text-on-surface-variant";

  return (
    <View className="flex-1 flex-row flex-wrap gap-2 items-center justify-center">
      {(module as any).items.map((item: any) => (
        <BounceButton
          key={item.id}
          onPress={() =>
            onChange({ ...itemValues, [item.id]: !itemValues[item.id] })
          }
          disabled={disabled}
          className={`px-3 py-2 h-14 rounded-xl items-center justify-center ${
            itemValues[item.id]
              ? `${accentBg} border-2 border-white/20`
              : "bg-surface-container-highest/40 border border-outline-variant/10"
          }`}
        >
          <Text
            className={`text-[8px] font-black uppercase ${itemValues[item.id] ? accentText : "text-on-surface-variant"}`}
          >
            {item.label}
          </Text>
        </BounceButton>
      ))}
    </View>
  );
}
