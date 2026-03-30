// components/scoring/SelectorModule.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { SelectorModule as SelectorModuleConfig } from '../../types/season';
import { ModuleCard } from '../ui/ModuleCard';

interface Props {
  module: SelectorModuleConfig;
  value: string | null;
  onChange: (v: string | null) => void;
  disabled: boolean;
  variant?: 'default' | 'compact';
  alliance?: 'red' | 'blue';
}

export function SelectorModule({ module, value, onChange, disabled, variant, alliance }: Props) {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <ModuleCard label={module.label} disabled={disabled} variant="compact" alliance={alliance}>
        <View className="flex-row flex-wrap gap-1">
          {module.options.map((option) => {
            const selected = value === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => !disabled && onChange(selected ? null : option.id)}
                disabled={disabled}
                className={`px-2 py-1 rounded-lg border ${
                  selected
                    ? 'bg-[#3B82F6] border-[#3B82F6]'
                    : 'bg-[#0F0F0F] border-[#2A2A2A]'
                }`}
              >
                <Text className={`text-[10px] font-medium ${selected ? 'text-white' : 'text-[#9CA3AF]'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ModuleCard>
    );
  }

  return (
    <ModuleCard label={module.label} description={module.description} disabled={disabled}>
      <View className="flex-row flex-wrap gap-2">
        {module.options.map((option) => {
          const selected = value === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => !disabled && onChange(selected ? null : option.id)}
              disabled={disabled}
              className={`px-3 py-2 rounded-xl border ${
                selected
                  ? 'bg-[#3B82F6] border-[#3B82F6]'
                  : 'bg-[#0F0F0F] border-[#2A2A2A]'
              }`}
            >
              <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-[#9CA3AF]'}`}>
                {option.label}
              </Text>
              <Text className={`text-xs ${selected ? 'text-blue-200' : 'text-[#6B7280]'}`}>
                {option.points}pts
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ModuleCard>
  );
}
