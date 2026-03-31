import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreMap } from "../../types/match";

interface ModuleToggleButtonProps {
  module: ModuleConfig;
  isSelected: boolean;
  onPress: () => void;
  scores?: ScoreMap;
  redScores?: ScoreMap;
  showBothAlliances?: boolean;
  disabled?: boolean;
}

function getPreviewText(
  module: ModuleConfig,
  scores: ScoreMap
): string | null {
  if (!("showPreview" in module) || !module.showPreview) return null;

  const value = scores[module.id];

  switch (module.type) {
    case "counter":
      return String(value ?? 0);
    case "boolean":
      return value === true ? "\u2713" : "\u2717";
    case "selector": {
      if (!value) return "—";
      const opt = (module as any).options?.find((o: any) => o.id === value);
      return opt?.label ?? "—";
    }
    default:
      return null;
  }
}

export function ModuleToggleButton({
  module,
  isSelected,
  onPress,
  scores = {},
  redScores,
  showBothAlliances = false,
  disabled = false,
}: ModuleToggleButtonProps) {
  const bluePreview = getPreviewText(module, scores);
  const redPreview = redScores ? getPreviewText(module, redScores) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center px-3 py-2 rounded-lg ${
        isSelected
          ? "bg-white border-2 border-white"
          : "bg-surface border border-border"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <Text
        className={`flex-1 font-semibold text-sm ${
          isSelected ? "text-black" : "text-text-primary"
        }`}
      >
        {module.label}
      </Text>

      {bluePreview && showBothAlliances && (
        <View className="flex-row gap-1 ml-2">
          {redPreview && (
            <Text className="text-xs text-auto font-bold">{redPreview}</Text>
          )}
          <Text className="text-xs text-primary font-bold">{bluePreview}</Text>
        </View>
      )}
      {bluePreview && !showBothAlliances && (
        <Text
          className={`text-xs ml-2 font-bold ${
            isSelected ? "text-gray-600" : "text-text-secondary"
          }`}
        >
          {bluePreview}
        </Text>
      )}
    </TouchableOpacity>
  );
}
