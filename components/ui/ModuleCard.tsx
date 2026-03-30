// components/ui/ModuleCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface ModuleCardProps {
  label: string;
  description?: string;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'compact';
  alliance?: 'red' | 'blue';
}

export function ModuleCard({ label, description, disabled, children, variant = 'default', alliance }: ModuleCardProps) {
  const isCompact = variant === 'compact';

  const borderColor = isCompact && alliance === 'blue'
    ? '#1E3A5F'
    : isCompact && alliance === 'red'
    ? '#5F1E1E'
    : '#2A2A2A';

  const bgColor = isCompact && alliance === 'blue'
    ? '#0A1628'
    : isCompact && alliance === 'red'
    ? '#280A0A'
    : '#1A1A1A';

  return (
    <View
      style={{ borderColor, backgroundColor: bgColor }}
      className={`border ${isCompact ? 'rounded-xl p-2 mb-2' : 'rounded-2xl p-4 mb-3'} ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={`text-[#F5F5F5] font-semibold ${isCompact ? 'text-xs mb-1' : 'text-base mb-1'}`}>
        {label}
      </Text>
      {!isCompact && description ? (
        <Text className="text-[#9CA3AF] text-xs mb-2">{description}</Text>
      ) : null}
      {children}
    </View>
  );
}
