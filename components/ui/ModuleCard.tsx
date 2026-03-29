// components/ui/ModuleCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface ModuleCardProps {
  label: string;
  description?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function ModuleCard({ label, description, disabled, children }: ModuleCardProps) {
  return (
    <View
      className={`rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 mb-3 ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className="text-[#F5F5F5] text-base font-semibold mb-1">{label}</Text>
      {description ? (
        <Text className="text-[#9CA3AF] text-xs mb-2">{description}</Text>
      ) : null}
      {children}
    </View>
  );
}
