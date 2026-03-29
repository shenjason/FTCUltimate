// components/scoring/BooleanModule.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { BooleanModule as BooleanModuleConfig } from '../../types/season';
import { ModuleCard } from '../ui/ModuleCard';

interface Props {
  module: BooleanModuleConfig;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}

export function BooleanModule({ module, value, onChange, disabled }: Props) {
  const active = value === true;
  return (
    <ModuleCard label={module.label} description={module.description} disabled={disabled}>
      <TouchableOpacity
        onPress={() => !disabled && onChange(!active)}
        disabled={disabled}
        className={`w-full rounded-xl py-3 items-center justify-center border ${
          active
            ? 'bg-[#3B82F6] border-[#3B82F6]'
            : 'bg-[#0F0F0F] border-[#2A2A2A]'
        }`}
      >
        <Text className={`font-semibold text-base ${active ? 'text-white' : 'text-[#9CA3AF]'}`}>
          {active ? `YES  +${module.points}pts` : 'NO'}
        </Text>
      </TouchableOpacity>
    </ModuleCard>
  );
}
