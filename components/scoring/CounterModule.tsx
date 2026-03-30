// components/scoring/CounterModule.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { CounterModule as CounterModuleConfig } from '../../types/season';
import { ModuleCard } from '../ui/ModuleCard';

interface Props {
  module: CounterModuleConfig;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  variant?: 'default' | 'compact';
  alliance?: 'red' | 'blue';
}

export function CounterModule({ module, value, onChange, disabled, variant, alliance }: Props) {
  const count = typeof value === 'number' ? value : 0;
  const step = module.step ?? 1;
  const isCompact = variant === 'compact';

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
      <ModuleCard label={module.label} disabled={disabled} variant="compact" alliance={alliance}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={decrement}
            disabled={disabled || count <= module.min}
            className="w-8 h-8 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] items-center justify-center"
          >
            <Text className="text-[#F5F5F5] text-base font-bold">−</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-[#F5F5F5] text-lg font-bold">{count}</Text>
            <Text className="text-[#9CA3AF] text-[10px]">{count * module.points}pts</Text>
          </View>

          <TouchableOpacity
            onPress={increment}
            disabled={disabled || (module.max !== undefined && count >= module.max)}
            className="w-8 h-8 rounded-lg bg-[#3B82F6] items-center justify-center"
          >
            <Text className="text-white text-base font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </ModuleCard>
    );
  }

  return (
    <ModuleCard label={module.label} description={module.description} disabled={disabled}>
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={decrement}
          disabled={disabled || count <= module.min}
          className="w-14 h-14 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] items-center justify-center"
        >
          <Text className="text-[#F5F5F5] text-2xl font-bold">−</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-[#F5F5F5] text-3xl font-bold">{count}</Text>
          <Text className="text-[#9CA3AF] text-xs">{count * module.points} pts</Text>
        </View>

        <TouchableOpacity
          onPress={increment}
          disabled={disabled || (module.max !== undefined && count >= module.max)}
          className="w-14 h-14 rounded-xl bg-[#3B82F6] items-center justify-center"
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
    </ModuleCard>
  );
}
