// components/ui/PhaseTab.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface PhaseTabProps {
  activeTab: 'auto' | 'teleop';
  onTabChange: (tab: 'auto' | 'teleop') => void;
  autoScore: number;
  teleopScore: number;
}

export function PhaseTab({ activeTab, onTabChange, autoScore, teleopScore }: PhaseTabProps) {
  return (
    <View className="flex-row mx-4 mb-3 bg-[#1A1A1A] rounded-xl p-1 border border-[#2A2A2A]">
      <TouchableOpacity
        onPress={() => onTabChange('auto')}
        className={`flex-1 py-2 rounded-lg items-center ${
          activeTab === 'auto' ? 'bg-[#EF4444]/15' : ''
        }`}
      >
        <Text className={`text-xs font-bold ${activeTab === 'auto' ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}`}>
          AUTONOMOUS
        </Text>
        <Text className={`text-sm font-semibold mt-0.5 ${activeTab === 'auto' ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
          {autoScore} pts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onTabChange('teleop')}
        className={`flex-1 py-2 rounded-lg items-center ${
          activeTab === 'teleop' ? 'bg-[#22C55E]/15' : ''
        }`}
      >
        <Text className={`text-xs font-bold ${activeTab === 'teleop' ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
          TELEOP
        </Text>
        <Text className={`text-sm font-semibold mt-0.5 ${activeTab === 'teleop' ? 'text-[#22C55E]' : 'text-[#6B7280]'}`}>
          {teleopScore} pts
        </Text>
      </TouchableOpacity>
    </View>
  );
}
