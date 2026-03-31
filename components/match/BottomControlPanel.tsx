import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";

interface BottomControlPanelProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (value: ScoreValue) => void;
  alliance: "blue" | "red";
  disabled?: boolean;
  layout?: "vertical" | "horizontal";
}

export function BottomControlPanel({
  module,
  value,
  onChange,
  alliance,
  disabled = false,
  layout = "vertical",
}: BottomControlPanelProps) {
  const bgClass = alliance === "blue" ? "bg-[#080818]" : "bg-[#1a0808]";

  return (
    <View className={`flex-1 ${bgClass} p-2 items-center justify-center`}>
      <Text className="text-xs text-text-secondary mb-2 uppercase">
        {module.label}
      </Text>
      {renderControls(module, value, onChange, disabled, layout)}
    </View>
  );
}

function renderControls(
  module: ModuleConfig,
  value: ScoreValue,
  onChange: (value: ScoreValue) => void,
  disabled: boolean,
  layout: "vertical" | "horizontal" = "vertical"
) {
  switch (module.type) {
    case "boolean":
      return (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onChange(true)}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg ${
              value === true ? "bg-white" : "bg-surface"
            }`}
          >
            <Text
              className={`font-semibold ${
                value === true ? "text-black" : "text-text-primary"
              }`}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChange(false)}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg ${
              value === false || value === null || value === undefined
                ? "bg-white"
                : "bg-surface"
            }`}
          >
            <Text
              className={`font-semibold ${
                value === false || value === null || value === undefined
                  ? "text-black"
                  : "text-text-primary"
              }`}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      );

    case "counter": {
      const count = (value as number) ?? 0;
      const min = (module as any).min ?? 0;
      const max = (module as any).max;
      const step = (module as any).step ?? 1;
      if (layout === "horizontal") {
        return (
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => onChange(Math.max(count - step, min))}
              disabled={disabled || count <= min}
              className="bg-surface px-6 py-3 rounded-lg"
            >
              <Text className="text-text-primary text-lg font-bold">−</Text>
            </TouchableOpacity>
            <Text className="text-text-primary text-3xl font-bold w-12 text-center">{count}</Text>
            <TouchableOpacity
              onPress={() => onChange(max !== undefined ? Math.min(count + step, max) : count + step)}
              disabled={disabled || (max !== undefined && count >= max)}
              className="bg-surface px-6 py-3 rounded-lg"
            >
              <Text className="text-text-primary text-lg font-bold">+</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <View className="items-center gap-1">
          <TouchableOpacity
            onPress={() => onChange(max !== undefined ? Math.min(count + step, max) : count + step)}
            disabled={disabled || (max !== undefined && count >= max)}
            className="bg-surface px-6 py-2 rounded-lg"
          >
            <Text className="text-text-primary text-lg font-bold">+</Text>
          </TouchableOpacity>
          <Text className="text-text-primary text-2xl font-bold">{count}</Text>
          <TouchableOpacity
            onPress={() => onChange(Math.max(count - step, min))}
            disabled={disabled || count <= min}
            className="bg-surface px-6 py-2 rounded-lg"
          >
            <Text className="text-text-primary text-lg font-bold">−</Text>
          </TouchableOpacity>
        </View>
      );
    }

    case "selector":
      return (
        <View className="flex-row flex-wrap gap-2 justify-center">
          {(module as any).options.map((opt: any) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onChange(value === opt.id ? null : opt.id)}
              disabled={disabled}
              className={`px-3 py-2 rounded-lg ${
                value === opt.id ? "bg-white" : "bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  value === opt.id ? "text-black" : "text-text-primary"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    case "tiered_counter": {
      const tierValues = (value as Record<string, number>) ?? {};
      return (
        <View className="flex-row gap-3">
          {(module as any).tiers.map((tier: any) => {
            const tierCount = tierValues[tier.id] ?? 0;
            return (
              <View key={tier.id} className="items-center">
                <Text className="text-xs text-text-secondary mb-1">
                  {tier.label}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    onChange({ ...tierValues, [tier.id]: tierCount + 1 })
                  }
                  disabled={disabled}
                  className="bg-surface px-3 py-1 rounded"
                >
                  <Text className="text-text-primary">+</Text>
                </TouchableOpacity>
                <Text className="text-text-primary text-lg font-bold">
                  {tierCount}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    onChange({
                      ...tierValues,
                      [tier.id]: Math.max(0, tierCount - 1),
                    })
                  }
                  disabled={disabled || tierCount <= 0}
                  className="bg-surface px-3 py-1 rounded"
                >
                  <Text className="text-text-primary">−</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      );
    }

    case "multi_boolean": {
      const itemValues = (value as Record<string, boolean>) ?? {};
      return (
        <View className="flex-row flex-wrap gap-2 justify-center">
          {(module as any).items.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                onChange({ ...itemValues, [item.id]: !itemValues[item.id] })
              }
              disabled={disabled}
              className={`px-3 py-2 rounded-lg ${
                itemValues[item.id] ? "bg-white" : "bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  itemValues[item.id] ? "text-black" : "text-text-primary"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    case "grid": {
      const cellValues = (value as Record<string, boolean>) ?? {};
      return (
        <View className="gap-1">
          {Array.from({ length: (module as any).rows }).map((_, row) => (
            <View key={row} className="flex-row gap-1">
              {Array.from({ length: (module as any).cols }).map((_, col) => {
                const cellId = `${row}_${col}`;
                return (
                  <TouchableOpacity
                    key={cellId}
                    onPress={() =>
                      onChange({ ...cellValues, [cellId]: !cellValues[cellId] })
                    }
                    disabled={disabled}
                    className={`w-8 h-8 rounded ${
                      cellValues[cellId] ? "bg-white" : "bg-surface"
                    }`}
                  />
                );
              })}
            </View>
          ))}
        </View>
      );
    }

    case "calculated":
      return (
        <Text className="text-text-secondary text-sm italic">
          Auto-calculated
        </Text>
      );

    default:
      return null;
  }
}
