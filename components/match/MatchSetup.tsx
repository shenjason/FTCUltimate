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
import { useHistoryStore } from '../../lib/store';
import type { MatchType, StartMode } from '../../types/match';
import type { SeasonConfig } from '../../types/season';

interface MatchSetupProps {
  season: SeasonConfig;
  onStart: (matchType: MatchType, matchName: string, alliance: 'red' | 'blue', startMode: StartMode) => void;
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
  const { matches } = useHistoryStore();
  const today = new Date();
  const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
    today.getDate()
  ).padStart(2, "0")}/${today.getFullYear()}`;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayMatchCount = matches.filter((m) => m.timestamp >= todayStart).length;
  const defaultMatchName = `Match #${todayMatchCount + 1} at ${dateStr}`;

  const [selectedType, setSelectedType] = useState<MatchType>('solo');
  const [matchName, setMatchName] = useState(defaultMatchName);
  const [alliance, setAlliance] = useState<'red' | 'blue'>('blue');
  const [selectedStartMode, setSelectedStartMode] = useState<StartMode>("auto_teleop");

  const handleStart = () => {
    onStart(selectedType, matchName, alliance, selectedStartMode);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text className="text-text-primary text-2xl font-bold mb-1">New Match</Text>
        <Text className="text-text-secondary text-sm mb-6">Configure and start a practice match</Text>

        {/* Season picker */}
        <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Season</Text>
        <SeasonPicker />

        {/* Match name */}
        <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-5 mb-2">
          Match Name
        </Text>
        <TextInput
          className="bg-surface border border-border rounded-xl px-3 py-3 text-text-primary text-sm"
          placeholder="e.g. Match #1 at 01/15/2026"
          placeholderTextColor="#4B5563"
          value={matchName}
          onChangeText={setMatchName}
        />

        {/* Match type cards */}
        <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-5 mb-3">
          Match Type
        </Text>
        <View className="gap-3">
          {MATCH_TYPE_CARDS.map((card) => {
            const isSelected = selectedType === card.type;
            return (
              <TouchableOpacity
                key={card.type}
                onPress={() => setSelectedType(card.type)}
                className={`flex-row items-center bg-surface rounded-2xl p-4 border ${
                  isSelected ? 'border-primary' : 'border-border'
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                    isSelected ? 'bg-primary/20' : 'bg-surface-light'
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
                      isSelected ? 'text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {card.title}
                  </Text>
                  <Text className="text-text-secondary text-xs mt-0.5">{card.description}</Text>
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
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-5 mb-3">
              Alliance
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setAlliance('blue')}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  alliance === 'blue'
                    ? 'bg-primary/20 border-primary'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    alliance === 'blue' ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  Blue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAlliance('red')}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  alliance === 'red'
                    ? 'bg-auto/20 border-auto'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    alliance === 'red' ? 'text-auto' : 'text-text-secondary'
                  }`}
                >
                  Red
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Start mode selector */}
        <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mt-5 mb-2">Start Mode</Text>
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={() => setSelectedStartMode("auto_teleop")}
            className={`flex-1 p-3 rounded-xl border ${
              selectedStartMode === "auto_teleop"
                ? "border-primary bg-primary/20"
                : "border-border bg-surface"
            }`}
          >
            <Text className={`font-bold text-center ${selectedStartMode === "auto_teleop" ? "text-primary" : "text-text-secondary"}`}>
              Auto + Teleop
            </Text>
            <Text className="text-text-secondary text-xs text-center mt-1">
              Full match flow
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedStartMode("teleop_only")}
            className={`flex-1 p-3 rounded-xl border ${
              selectedStartMode === "teleop_only"
                ? "border-primary bg-primary/20"
                : "border-border bg-surface"
            }`}
          >
            <Text className={`font-bold text-center ${selectedStartMode === "teleop_only" ? "text-primary" : "text-text-secondary"}`}>
              Teleop Only
            </Text>
            <Text className="text-text-secondary text-xs text-center mt-1">
              Skip autonomous
            </Text>
          </TouchableOpacity>
        </View>

        {/* Start button */}
        <TouchableOpacity
          onPress={handleStart}
          className="mt-4 bg-primary rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">Start Match</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
