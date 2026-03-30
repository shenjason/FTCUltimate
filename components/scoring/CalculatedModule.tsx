// components/scoring/CalculatedModule.tsx
import React from 'react';
import { View, Text } from 'react-native';
import type { CalculatedModule as CalculatedModuleConfig } from '../../types/season';
import { ModuleCard } from '../ui/ModuleCard';

interface Props {
  module: CalculatedModuleConfig;
  computedValue: number;   // pre-computed by parent using computeScore logic
  disabled: boolean;
  variant?: 'default' | 'compact';
  alliance?: 'red' | 'blue';
}

export function CalculatedModule({ module, computedValue, disabled, variant, alliance }: Props) {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <ModuleCard label={module.label} disabled={disabled} variant="compact" alliance={alliance}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[#9CA3AF] text-[10px]">Calculated</Text>
          <View className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-2 py-1">
            <Text className="text-[#F5F5F5] text-sm font-bold">{computedValue}pts</Text>
          </View>
        </View>
      </ModuleCard>
    );
  }

  return (
    <ModuleCard label={module.label} description={module.description} disabled={disabled}>
      <View className="flex-row items-center justify-between">
        <Text className="text-[#9CA3AF] text-xs">Auto-calculated</Text>
        <View className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-2">
          <Text className="text-[#F5F5F5] text-xl font-bold">{computedValue} pts</Text>
        </View>
      </View>
    </ModuleCard>
  );
}
