// components/scoring/CounterModule.tsx
import React from "react";
import { View, Text } from "react-native";
import { BounceButton } from "../ui/AnimatedPressable";
import THEME from "../../lib/theme";
import type { CounterModule as CounterModuleConfig } from "../../types/season";
import { ModuleCard } from "../ui/ModuleCard";

interface Props {
  module: CounterModuleConfig;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  variant?: "default" | "compact";
  alliance?: "red" | "blue";
  isSolo?: boolean;
}

export function CounterModule({
  module,
  value,
  onChange,
  disabled,
  variant,
  alliance,
  isSolo,
}: Props) {
  const count = typeof value === "number" ? value : 0;
  const step = module.step ?? 1;
  const isCompact = variant === "compact" || isSolo;

  const decrement = () => {
    if (disabled) return;
    onChange(Math.max(module.min, count - step));
  };
  const increment = () => {
    if (disabled) return;
    const next = count + step;
    onChange(module.max !== undefined ? Math.min(module.max, next) : next);
  };

  if (isCompact) {
    return (
      <ModuleCard
        label={module.label}
        disabled={disabled}
        variant="compact"
        alliance={alliance}
      >
        <View className="flex-row items-center justify-between">
          <BounceButton
            onPress={decrement}
            disabled={disabled || count <= module.min}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-8 h-8 rounded-lg bg-surface-dim border border-outline-variant items-center justify-center"
          >
            <Text
              style={{ color: THEME.colors.currentValue }}
              className="text-base font-bold"
            >
              −
            </Text>
          </BounceButton>

          <View className="items-center">
            <Text
              style={{ color: THEME.colors.currentValue }}
              className="text-lg font-bold"
            >
              {count}
            </Text>
            <Text
              style={{ color: THEME.colors.labelMuted }}
              className="text-[10px]"
            >
              {count * module.points} pts
            </Text>
          </View>

          <BounceButton
            onPress={increment}
            disabled={
              disabled || (module.max !== undefined && count >= module.max)
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-8 h-8 rounded-lg bg-stitch-primary items-center justify-center"
          >
            <Text
              style={{ color: THEME.colors.currentValue }}
              className="text-base font-bold"
            >
              +
            </Text>
          </BounceButton>
        </View>
      </ModuleCard>
    );
  }

  return (
    <ModuleCard
      label={module.label}
      description={module.description}
      disabled={disabled}
    >
      <View className="flex-row items-center justify-between">
        <BounceButton
          onPress={decrement}
          disabled={disabled || count <= module.min}
          className="w-14 h-14 rounded-xl bg-surface-dim border border-outline-variant items-center justify-center"
        >
          <Text
            style={{ color: THEME.colors.currentValue }}
            className="text-2xl font-bold"
          >
            −
          </Text>
        </BounceButton>

        <View className="items-center">
          <Text
            style={{ color: THEME.colors.currentValue }}
            className="text-3xl font-bold"
          >
            {count}
          </Text>
          <Text style={{ color: THEME.colors.labelMuted }} className="text-xs">
            {count * module.points} pts
          </Text>
        </View>

        <BounceButton
          onPress={increment}
          disabled={
            disabled || (module.max !== undefined && count >= module.max)
          }
          className="w-14 h-14 rounded-xl bg-stitch-primary items-center justify-center"
        >
          <Text
            style={{ color: THEME.colors.currentValue }}
            className="text-2xl font-bold"
          >
            +
          </Text>
        </BounceButton>
      </View>
    </ModuleCard>
  );
}
