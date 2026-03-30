// components/match/TimerOnlyMatch.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchTimer } from '../timer/MatchTimer';
import type { SeasonConfig } from '../../types/season';

interface TimerOnlyMatchProps {
  season: SeasonConfig;
  onBack: () => void;
}

export function TimerOnlyMatch({ season, onBack }: TimerOnlyMatchProps) {
  return (
    <View className="flex-1 bg-[#0F0F0F] items-center justify-center px-6">
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        className="absolute top-12 left-6 flex-row items-center gap-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
        <Text className="text-[#9CA3AF] text-sm">Setup</Text>
      </TouchableOpacity>

      {/* Season label */}
      <Text className="text-[#9CA3AF] text-xs mb-8 tracking-widest uppercase">
        {season.name}
      </Text>

      {/* Circular timer */}
      <MatchTimer season={season} />
    </View>
  );
}
