import React from "react";
import { View, Text } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { BounceButton } from "../../ui/AnimatedPressable";
import { MaterialIcon } from "../../ui/MaterialIcon";
import THEME from "../../../lib/theme";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
}

export default function BooleanFooter({
  value,
  onChange,
  disabled = false,
  alliance,
}: Props) {
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
    <View className="flex-1 flex-row gap-3 h-full items-center">
      <BounceButton
        onPress={() => onChange(true)}
        disabled={disabled}
        className={`flex-1 h-16 rounded-xl items-center justify-center ${
          value === true
            ? `${accentBg} shadow-lg`
            : "bg-surface-container-highest/40 border border-outline-variant/10"
        }`}
      >
        <MaterialIcon
          name="check"
          size={20}
          color={
            value === true
              ? alliance === "blue"
                ? THEME.colors.blueIcon
                : alliance === "red"
                  ? THEME.colors.redIcon
                  : THEME.colors.mutedIcon
              : THEME.colors.mutedIcon
          }
        />
        <Text
          className={`text-[8px] font-black uppercase mt-1 tracking-tight ${
            value === true ? accentText : "text-on-surface-variant"
          }`}
        >
          Yes
        </Text>
      </BounceButton>

      <BounceButton
        onPress={() => onChange(false)}
        disabled={disabled}
        className={`flex-1 h-16 rounded-xl items-center justify-center ${
          value !== true
            ? `${accentBg} shadow-lg`
            : "bg-surface-container-highest/40 border border-outline-variant/10"
        }`}
      >
        <MaterialIcon
          name="close"
          size={20}
          color={
            value !== true
              ? alliance === "blue"
                ? THEME.colors.blueIcon
                : alliance === "red"
                  ? THEME.colors.redIcon
                  : THEME.colors.mutedIcon
              : THEME.colors.mutedIcon
          }
        />
        <Text
          className={`text-[8px] font-black uppercase mt-1 tracking-tight ${
            value !== true ? accentText : "text-on-surface-variant"
          }`}
        >
          No
        </Text>
      </BounceButton>
    </View>
  );
}
