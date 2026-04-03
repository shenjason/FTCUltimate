// components/scoring/TieredCounterModule.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { TieredCounterModule as TieredCounterConfig } from "../../types/season";
import { ModuleCard } from "../ui/ModuleCard";

interface Props {
  module: TieredCounterConfig;
  value: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
  disabled: boolean;
  variant?: "default" | "compact";
  alliance?: "red" | "blue";
}

export function TieredCounterModule({
  module,
  value,
  onChange,
  disabled,
  variant,
  alliance,
}: Props) {
  const tiers = value ?? {};
  const isCompact = variant === "compact";

  const adjust = (tierId: string, delta: number) => {
    if (disabled) return;
    const current = typeof tiers[tierId] === "number" ? tiers[tierId] : 0;
    const next = Math.max(0, current + delta);
    onChange({ ...tiers, [tierId]: next });
  };

  if (isCompact) {
    return (
      <ModuleCard
        label={module.label}
        disabled={disabled}
        variant="compact"
        alliance={alliance}
      >
        {module.tiers.map((tier) => {
          const count = typeof tiers[tier.id] === "number" ? tiers[tier.id] : 0;
          return (
            <View
              key={tier.id}
              className="flex-row items-center justify-between mb-1"
            >
              <Text
                className="text-on-surface text-[10px] flex-1"
                numberOfLines={1}
              >
                {tier.label}
              </Text>
              <View className="flex-row items-center gap-1">
                <TouchableOpacity
                  onPress={() => adjust(tier.id, -1)}
                  disabled={disabled || count <= 0}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="w-6 h-6 rounded bg-surface-dim border border-outline-variant items-center justify-center"
                >
                  <Text className="text-on-surface text-xs font-bold">−</Text>
                </TouchableOpacity>
                <Text className="text-on-surface text-sm font-bold w-5 text-center">
                  {count}
                </Text>
                <TouchableOpacity
                  onPress={() => adjust(tier.id, 1)}
                  disabled={disabled}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="w-6 h-6 rounded bg-stitch-primary items-center justify-center"
                >
                  <Text className="text-white text-xs font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ModuleCard>
    );
  }

  return (
    <ModuleCard
      label={module.label}
      description={module.description}
      disabled={disabled}
    >
      {module.tiers.map((tier) => {
        const count = typeof tiers[tier.id] === "number" ? tiers[tier.id] : 0;
        return (
          <View
            key={tier.id}
            className="flex-row items-center justify-between mb-2"
          >
            <View className="flex-1">
              <Text className="text-on-surface text-sm">{tier.label}</Text>
              <Text className="text-on-surface-variant text-xs">
                {tier.points}pts each
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => adjust(tier.id, -1)}
                disabled={disabled || count <= 0}
                className="w-12 h-12 rounded-xl bg-surface-dim border border-outline-variant items-center justify-center"
              >
                <Text className="text-on-surface text-xl font-bold">−</Text>
              </TouchableOpacity>
              <Text className="text-on-surface text-xl font-bold w-8 text-center">
                {count}
              </Text>
              <TouchableOpacity
                onPress={() => adjust(tier.id, 1)}
                disabled={disabled}
                className="w-12 h-12 rounded-xl bg-stitch-primary items-center justify-center"
              >
                <Text className="text-white text-xl font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ModuleCard>
  );
}
