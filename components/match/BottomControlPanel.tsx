import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";
import { MaterialIcon } from "../ui/MaterialIcon";

interface BottomControlPanelProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (value: ScoreValue) => void;
  alliance: "blue" | "red";
  disabled?: boolean;
}

export function BottomControlPanel({
  module,
  value,
  onChange,
  alliance,
  disabled = false,
}: BottomControlPanelProps) {
  return (
    <View className="flex-1 flex-row items-center px-4 gap-2">
      {renderControls(module, value, onChange, disabled, alliance)}
    </View>
  );
}

function renderControls(
  module: ModuleConfig,
  value: ScoreValue,
  onChange: (value: ScoreValue) => void,
  disabled: boolean,
  alliance: "blue" | "red"
) {
  const accentBg = alliance === "blue" ? "bg-primary" : "bg-error";
  const accentText = alliance === "blue" ? "text-on-primary" : "text-on-error";

  switch (module.type) {
    case "boolean":
      return (
        <View className="flex-1 flex-row gap-3 h-full items-center">
          <TouchableOpacity
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
              color={value === true ? (alliance === "blue" ? "#002d64" : "#490013") : "#a8abb6"}
            />
            <Text
              className={`text-[8px] font-black uppercase mt-1 tracking-tight ${
                value === true ? accentText : "text-on-surface-variant"
              }`}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
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
              color={value !== true ? (alliance === "blue" ? "#002d64" : "#490013") : "#a8abb6"}
            />
            <Text
              className={`text-[8px] font-black uppercase mt-1 tracking-tight ${
                value !== true ? accentText : "text-on-surface-variant"
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
      return (
        <View className="flex-1 flex-col justify-center">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[9px] uppercase font-bold tracking-[0.2em] text-on-surface-variant">
              {module.label}
            </Text>
            <Text className="text-3xl font-black text-on-surface">
              {String(count).padStart(2, "0")}
            </Text>
          </View>
          <View className="flex-row gap-3 h-12">
            <TouchableOpacity
              onPress={() => onChange(Math.max(count - step, min))}
              disabled={disabled || count <= min}
              className="flex-1 bg-surface-container-highest rounded-xl items-center justify-center active:opacity-70"
            >
              <MaterialIcon name="remove" size={22} color="#e8eaf7" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onChange(
                  max !== undefined ? Math.min(count + step, max) : count + step
                )
              }
              disabled={disabled || (max !== undefined && count >= max)}
              className={`flex-[2] ${accentBg} rounded-xl items-center justify-center active:opacity-70`}
            >
              <MaterialIcon
                name="add"
                size={22}
                color={alliance === "blue" ? "#002d64" : "#490013"}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    case "selector": {
      const mod = module as ModuleConfig & {
        options: { id: string; label: string; points?: number }[];
      };
      return (
        <View className="flex-1 flex-row items-center justify-around gap-2">
          {mod.options.map((opt) => {
            const isActive = value === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => onChange(value === opt.id ? null : opt.id)}
                disabled={disabled}
                className={`flex-1 h-16 rounded-xl flex-col items-center justify-center gap-1 active:scale-95 ${
                  isActive
                    ? "bg-secondary border-2 border-white/20 shadow-lg"
                    : "bg-surface-container-highest/40 border border-outline-variant/10"
                }`}
                style={isActive ? { transform: [{ scale: 1.05 }], zIndex: 10 } : undefined}
              >
                <Text
                  className={`text-[8px] font-black uppercase leading-none text-center tracking-tight ${
                    isActive ? "text-on-secondary" : "text-on-surface-variant"
                  }`}
                >
                  {opt.label}
                </Text>
                {opt.points != null && (
                  <Text
                    className={`text-[7px] ${
                      isActive ? "text-on-secondary opacity-80" : "text-on-surface-variant opacity-70"
                    }`}
                  >
                    ({opt.points}pts)
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    case "tiered_counter": {
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
                  <TouchableOpacity
                    onPress={() =>
                      onChange({ ...tierValues, [tier.id]: Math.max(0, tierCount - 1) })
                    }
                    disabled={disabled || tierCount <= 0}
                    className="flex-1 bg-surface-container-highest rounded-xl items-center justify-center"
                  >
                    <MaterialIcon name="remove" size={18} color="#e8eaf7" />
                  </TouchableOpacity>
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-xl font-black text-on-surface">{tierCount}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      onChange({ ...tierValues, [tier.id]: tierCount + 1 })
                    }
                    disabled={disabled}
                    className={`flex-1 ${accentBg} rounded-xl items-center justify-center`}
                  >
                    <MaterialIcon
                      name="add"
                      size={18}
                      color={alliance === "blue" ? "#002d64" : "#490013"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    case "multi_boolean": {
      const itemValues = (value as Record<string, boolean>) ?? {};
      return (
        <View className="flex-1 flex-row flex-wrap gap-2 items-center justify-center">
          {(module as any).items.map((item: any) => (
            <TouchableOpacity
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
                className={`text-[8px] font-black uppercase ${
                  itemValues[item.id] ? accentText : "text-on-surface-variant"
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
        <View className="flex-1 flex-col gap-1 items-center justify-center">
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
                    className={`w-9 h-9 rounded-lg ${
                      cellValues[cellId]
                        ? accentBg
                        : "bg-surface-container-highest/40 border border-outline-variant/10"
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
        <Text className="text-on-surface-variant text-sm italic">
          Auto-calculated
        </Text>
      );

    default:
      return null;
  }
}
