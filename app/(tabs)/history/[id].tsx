// app/(tabs)/history/[id].tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHistoryStore } from '../../../lib/store';
import { getSeasonById } from '../../../lib/seasonLoader';
import { ModuleRenderer } from '../../../components/scoring/ModuleRenderer';
import type { ScoreValue } from '../../../types/match';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { matches } = useHistoryStore();
  const match = matches.find((m) => m.id === id);

  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F0F] items-center justify-center">
        <Text className="text-[#9CA3AF]">Match not found</Text>
      </SafeAreaView>
    );
  }

  const season = getSeasonById(match.seasonId);
  const date = new Date(match.timestamp);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-[#2A2A2A]">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#F5F5F5" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[#F5F5F5] font-bold text-base" numberOfLines={1}>
            {season.name}
          </Text>
          <Text className="text-[#9CA3AF] text-xs">
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[#F5F5F5] text-2xl font-bold">{match.totalScore}</Text>
          <Text className="text-[#9CA3AF] text-xs">pts</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}>
        {/* Score breakdown */}
        <View className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 mb-4 flex-row justify-around">
          <View className="items-center">
            <Text className="text-[#EF4444] text-xl font-bold">{match.autoScore}</Text>
            <Text className="text-[#9CA3AF] text-xs">Auto</Text>
          </View>
          <View className="w-px bg-[#2A2A2A]" />
          <View className="items-center">
            <Text className="text-[#22C55E] text-xl font-bold">{match.teleopScore}</Text>
            <Text className="text-[#9CA3AF] text-xs">Teleop</Text>
          </View>
          <View className="w-px bg-[#2A2A2A]" />
          <View className="items-center">
            <Text className="text-[#F5F5F5] text-xl font-bold">{match.totalScore}</Text>
            <Text className="text-[#9CA3AF] text-xs">Total</Text>
          </View>
        </View>

        {/* Auto modules (read-only) */}
        <Text className="text-[#EF4444] text-xs font-bold tracking-widest mb-2">─ AUTONOMOUS</Text>
        {season.autonomous.map((module) => (
          <ModuleRenderer
            key={module.id}
            module={module}
            scores={match.allScores}
            onChangeScore={() => {}}
            disabled={true}
            period="auto"
          />
        ))}

        <View className="h-px bg-[#2A2A2A] my-4" />

        {/* Teleop modules (read-only) */}
        <Text className="text-[#22C55E] text-xs font-bold tracking-widest mb-2">─ TELEOP</Text>
        {season.teleop.map((module) => (
          <ModuleRenderer
            key={module.id}
            module={module}
            scores={match.allScores}
            onChangeScore={() => {}}
            disabled={true}
            period="teleop"
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
