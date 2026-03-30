// components/match/MatchSetup.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SeasonPicker } from '../ui/SeasonPicker';
import type { MatchType } from '../../types/match';
import type { SeasonConfig } from '../../types/season';

interface MatchSetupProps {
  season: SeasonConfig;
  onStart: (matchType: MatchType, matchNumber: number | undefined, alliance: 'red' | 'blue') => void;
}

const MATCH_TYPE_CARDS: { type: MatchType; title: string; description: string; icon: string }[] = [
  {
    type: 'timer_only',
    title: 'Timer Only',
    description: 'Run the match clock without scoring',
    icon: 'timer-outline',
  },
  {
    type: 'solo',
    title: 'Solo',
    description: 'Score one alliance only',
    icon: 'person-outline',
  },
  {
    type: 'full',
    title: 'Full Match',
    description: 'Score both alliances side by side',
    icon: 'people-outline',
  },
];

export function MatchSetup({ season, onStart }: MatchSetupProps) {
  const [selectedType, setSelectedType] = useState<MatchType>('solo');
  const [matchNumberText, setMatchNumberText] = useState('');
  const [alliance, setAlliance] = useState<'red' | 'blue'>('blue');

  const handleStart = () => {
    const matchNumber = matchNumberText.trim() !== '' ? parseInt(matchNumberText, 10) : undefined;
    onStart(selectedType, matchNumber, alliance);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0F0F0F]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text className="text-[#F5F5F5] text-2xl font-bold mb-1">New Match</Text>
        <Text className="text-[#9CA3AF] text-sm mb-6">Configure and start a practice match</Text>

        {/* Season picker */}
        <Text className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-2">Season</Text>
        <SeasonPicker />

        {/* Match number */}
        <Text className="text-[#9CA3AF] text-xs uppercase tracking-widest mt-5 mb-2">
          Match Number <Text className="text-[#9CA3AF] normal-case">(optional)</Text>
        </Text>
        <TextInput
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#F5F5F5] text-sm"
          placeholder="e.g. 12"
          placeholderTextColor="#4B5563"
          keyboardType="number-pad"
          value={matchNumberText}
          onChangeText={setMatchNumberText}
          maxLength={4}
        />

        {/* Match type cards */}
        <Text className="text-[#9CA3AF] text-xs uppercase tracking-widest mt-5 mb-3">
          Match Type
        </Text>
        <View className="gap-3">
          {MATCH_TYPE_CARDS.map((card) => {
            const isSelected = selectedType === card.type;
            return (
              <TouchableOpacity
                key={card.type}
                onPress={() => setSelectedType(card.type)}
                className={`flex-row items-center bg-[#1A1A1A] rounded-2xl p-4 border ${
                  isSelected ? 'border-[#3B82F6]' : 'border-[#2A2A2A]'
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                    isSelected ? 'bg-[#3B82F6]/20' : 'bg-[#2A2A2A]'
                  }`}
                >
                  <Ionicons
                    name={card.icon as any}
                    size={20}
                    color={isSelected ? '#3B82F6' : '#9CA3AF'}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-[#F5F5F5]' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {card.title}
                  </Text>
                  <Text className="text-[#9CA3AF] text-xs mt-0.5">{card.description}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alliance selector — hidden for 'full' mode */}
        {selectedType === 'solo' && (
          <>
            <Text className="text-[#9CA3AF] text-xs uppercase tracking-widest mt-5 mb-3">
              Alliance
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setAlliance('blue')}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  alliance === 'blue'
                    ? 'bg-[#3B82F6]/20 border-[#3B82F6]'
                    : 'bg-[#1A1A1A] border-[#2A2A2A]'
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    alliance === 'blue' ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'
                  }`}
                >
                  Blue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAlliance('red')}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  alliance === 'red'
                    ? 'bg-[#EF4444]/20 border-[#EF4444]'
                    : 'bg-[#1A1A1A] border-[#2A2A2A]'
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    alliance === 'red' ? 'text-[#EF4444]' : 'text-[#9CA3AF]'
                  }`}
                >
                  Red
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Start button */}
        <TouchableOpacity
          onPress={handleStart}
          className="mt-8 bg-[#3B82F6] rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">Start Match</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
