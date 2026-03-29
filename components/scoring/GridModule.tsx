// components/scoring/GridModule.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { GridModule as GridModuleConfig } from '../../types/season';
import { ModuleCard } from '../ui/ModuleCard';

interface Props {
  module: GridModuleConfig;
  value: Record<string, boolean>;
  bonusValues: Record<string, boolean>;
  onChange: (v: Record<string, boolean>) => void;
  onBonusChange: (bonusId: string, v: boolean) => void;
  disabled: boolean;
}

export function GridModule({ module, value, bonusValues, onChange, onBonusChange, disabled }: Props) {
  const cells = value ?? {};
  const bvs = bonusValues ?? {};

  const toggleCell = (row: number, col: number) => {
    if (disabled) return;
    const key = `${row}_${col}`;
    onChange({ ...cells, [key]: !cells[key] });
  };

  const filledCount = Object.values(cells).filter(Boolean).length;

  return (
    <ModuleCard label={module.label} description={module.description} disabled={disabled}>
      <Text className="text-[#9CA3AF] text-xs mb-2">
        {filledCount} cells · {filledCount * module.pointsPerCell}pts
      </Text>
      {Array.from({ length: module.rows }, (_, row) => (
        <View key={row} className="flex-row gap-1 mb-1">
          {Array.from({ length: module.cols }, (_, col) => {
            const key = `${row}_${col}`;
            const filled = cells[key] === true;
            return (
              <TouchableOpacity
                key={col}
                onPress={() => toggleCell(row, col)}
                disabled={disabled}
                className={`flex-1 aspect-square rounded border ${
                  filled ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-[#0F0F0F] border-[#2A2A2A]'
                }`}
              />
            );
          })}
        </View>
      ))}
      {module.bonuses && module.bonuses.length > 0 && (
        <View className="mt-3">
          <Text className="text-[#9CA3AF] text-xs mb-1">Bonuses</Text>
          {module.bonuses.map((bonus) => {
            const active = bvs[bonus.id] === true;
            return (
              <TouchableOpacity
                key={bonus.id}
                onPress={() => !disabled && onBonusChange(bonus.id, !active)}
                disabled={disabled}
                className={`flex-row items-center justify-between rounded-xl py-2 px-3 mb-1 border ${
                  active ? 'bg-[#3B82F6] border-[#3B82F6]' : 'bg-[#0F0F0F] border-[#2A2A2A]'
                }`}
              >
                <Text className={`text-sm ${active ? 'text-white' : 'text-[#9CA3AF]'}`}>
                  {bonus.label}
                </Text>
                <Text className={`text-xs ${active ? 'text-blue-200' : 'text-[#6B7280]'}`}>
                  +{bonus.points}pts
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ModuleCard>
  );
}
