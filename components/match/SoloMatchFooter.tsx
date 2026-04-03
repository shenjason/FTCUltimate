import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";
import FooterModule from "./FooterModule";

interface SoloMatchFooterProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (value: ScoreValue) => void;
  alliance: "blue" | "red";
  disabled?: boolean;
}

export function SoloMatchFooter({
  module,
  value,
  onChange,
  alliance,
  disabled = false,
}: SoloMatchFooterProps) {
  return (
    <View className="flex-1 flex-row items-center px-4 gap-2">
      <FooterModule
        module={module}
        value={value}
        onChange={onChange}
        disabled={disabled}
        alliance={alliance}
        matchType="solo"
      />
    </View>
  );
}
