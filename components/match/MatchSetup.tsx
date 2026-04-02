// components/match/MatchSetup.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BounceButton } from '../ui/AnimatedPressable';
import { Ionicons } from '@expo/vector-icons';
import { SeasonPicker } from '../ui/SeasonPicker';
import { useHistoryStore } from '../../lib/store';
import type { MatchType, StartMode } from '../../types/match';
import type { SeasonConfig } from '../../types/season';

interface MatchSetupProps {
  season: SeasonConfig;
  onStart: (matchType: MatchType, matchName: string, alliance: 'red' | 'blue', startMode: StartMode) => void;
}

type MatchTypeCard = {
  type: MatchType;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MATCH_TYPE_CARDS: MatchTypeCard[] = [
  { type: 'timer_only', title: 'Timer', icon: 'timer-outline' },
  { type: 'solo', title: 'Solo', icon: 'person-outline' },
  { type: 'full', title: 'Full Match', icon: 'people-outline' },
];

const LABEL_STYLE = {
  color: '#84adff',
  fontSize: 10,
  fontWeight: '700' as const,
  letterSpacing: 1.5,
  textTransform: 'uppercase' as const,
  marginBottom: 10,
};

export function MatchSetup({ season, onStart }: MatchSetupProps) {
  const { matches } = useHistoryStore();
  const today = new Date();
  const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(
    today.getDate()
  ).padStart(2, '0')}/${today.getFullYear()}`;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayMatchCount = matches.filter((m) => m.timestamp >= todayStart).length;
  const defaultMatchName = `Match #${todayMatchCount + 1} at ${dateStr}`;

  const [selectedType, setSelectedType] = useState<MatchType>('solo');
  const [matchName, setMatchName] = useState(defaultMatchName);
  const [alliance, setAlliance] = useState<'red' | 'blue'>('blue');
  const [selectedStartMode, setSelectedStartMode] = useState<StartMode>('auto_teleop');

  const handleStart = () => {
    onStart(selectedType, matchName, alliance, selectedStartMode);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0a0e16' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingTop: 32, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero header */}
        <Text
          style={{
            color: '#e8eaf7',
            fontSize: 36,
            fontWeight: '700',
            letterSpacing: -1,
            marginBottom: 4,
          }}
        >
          New Match
        </Text>
        <Text
          style={{ color: '#a8abb6', fontSize: 14, marginBottom: 36 }}
        >
          Configure and start a practice match
        </Text>

        {/* Season picker */}
        <Text style={LABEL_STYLE}>Season Selection</Text>
        <View
          style={{
            backgroundColor: '#202632',
            borderRadius: 12,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <SeasonPicker />
        </View>

        {/* Match name */}
        <Text style={LABEL_STYLE}>Match Name</Text>
        <TextInput
          style={{
            backgroundColor: '#202632',
            borderRadius: 12,
            paddingHorizontal: 20,
            paddingVertical: 16,
            color: '#e8eaf7',
            fontSize: 15,
            marginBottom: 24,
          }}
          placeholder="e.g. Match #1 at 01/15/2026"
          placeholderTextColor="#444852"
          value={matchName}
          onChangeText={setMatchName}
        />

        {/* Match type — 3-column grid */}
        <Text style={LABEL_STYLE}>Mode</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {MATCH_TYPE_CARDS.map((card) => {
            const isSelected = selectedType === card.type;
            return (
              <BounceButton
                key={card.type}
                onPress={() => setSelectedType(card.type)}
                style={{
                  flex: 1,
                  backgroundColor: isSelected ? '#202632' : '#0f131d',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  borderWidth: 2,
                  borderColor: isSelected ? '#84adff' : 'transparent',
                }}
              >
                {isSelected && (
                  <View style={{ position: 'absolute', top: 8, right: 8 }}>
                    <Ionicons name="checkmark-circle" size={14} color="#84adff" />
                  </View>
                )}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isSelected ? 'rgba(132,173,255,0.2)' : '#202632',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={card.icon}
                    size={20}
                    color={isSelected ? '#84adff' : '#a8abb6'}
                  />
                </View>
                <Text
                  style={{
                    color: isSelected ? '#84adff' : '#a8abb6',
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}
                >
                  {card.title}
                </Text>
              </BounceButton>
            );
          })}
        </View>

        {/* Start mode — pill toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#0f131d',
            borderRadius: 50,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {(['auto_teleop', 'teleop_only'] as StartMode[]).map((mode) => {
            const isActive = selectedStartMode === mode;
            return (
              <BounceButton
                key={mode}
                onPress={() => setSelectedStartMode(mode)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 50,
                  backgroundColor: isActive ? '#202632' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isActive ? '#84adff' : 'rgba(168,171,182,0.6)',
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}
                >
                  {mode === 'auto_teleop' ? 'Auto + Teleop' : 'Teleop Only'}
                </Text>
              </BounceButton>
            );
          })}
        </View>

        {/* Alliance selector — solo only */}
        {selectedType === 'solo' && (
          <>
            <Text style={LABEL_STYLE}>Alliance</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <BounceButton
                onPress={() => setAlliance('blue')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: alliance === 'blue' ? 'rgba(132,173,255,0.15)' : '#0f131d',
                  borderWidth: 2,
                  borderColor: alliance === 'blue' ? '#84adff' : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: alliance === 'blue' ? '#84adff' : '#a8abb6',
                    fontWeight: '700',
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Blue
                </Text>
              </BounceButton>
              <BounceButton
                onPress={() => setAlliance('red')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: alliance === 'red' ? 'rgba(255,110,132,0.15)' : '#0f131d',
                  borderWidth: 2,
                  borderColor: alliance === 'red' ? '#ff6e84' : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: alliance === 'red' ? '#ff6e84' : '#a8abb6',
                    fontWeight: '700',
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Red
                </Text>
              </BounceButton>
            </View>
          </>
        )}

        {/* Start button */}
        <BounceButton
          onPress={handleStart}
          style={{
            backgroundColor: '#84adff',
            borderRadius: 12,
            paddingVertical: 20,
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <Text
            style={{
              color: '#002d64',
              fontWeight: '700',
              fontSize: 17,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Start Match
          </Text>
        </BounceButton>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
