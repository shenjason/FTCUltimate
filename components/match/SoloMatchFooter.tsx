import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";
import renderFooter from "./footer";

interface SoloMatchFooterProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (value: ScoreValue) => void;
  disabled?: boolean;
}

export function SoloMatchFooter({
  module,
  value,
  onChange,
  disabled = false,
}: SoloMatchFooterProps) {
  return (
    <View className="flex-1 flex-row items-center px-4 gap-2">
      {renderFooter({ module, value, onChange, disabled })}
    </View>
  );
}
