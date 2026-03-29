// app/(tabs)/history/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHistoryStore } from '../../../lib/store';
import { getSeasons } from '../../../lib/seasonLoader';
import type { SavedMatch } from '../../../types/match';

function MatchCard({
  match,
  onDelete,
}: {
  match: SavedMatch;
  onDelete: () => void;
}) {
  const router = useRouter();
  const seasons = getSeasons();
  const season = seasons.find((s) => s.id === match.seasonId);
  const date = new Date(match.timestamp);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/history/${match.id}`)}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 mb-3 mx-4"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-[#F5F5F5] font-semibold text-sm" numberOfLines={1}>
            {season?.name ?? match.seasonId}
          </Text>
          <Text className="text-[#9CA3AF] text-xs mt-0.5">
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[#F5F5F5] text-2xl font-bold">{match.totalScore}</Text>
          <Text className="text-[#9CA3AF] text-xs">pts</Text>
        </View>
      </View>
      <View className="flex-row gap-4 mt-3">
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <Text className="text-[#9CA3AF] text-xs">AUTO {match.autoScore}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <Text className="text-[#9CA3AF] text-xs">TELEOP {match.teleopScore}</Text>
        </View>
        {match.tags && match.tags.length > 0 && (
          <View className="flex-row gap-1 flex-wrap">
            {match.tags.map((tag) => (
              <View key={tag} className="bg-[#2A2A2A] px-2 py-0.5 rounded-full">
                <Text className="text-[#9CA3AF] text-xs">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={onDelete}
        className="absolute top-3 right-3 w-8 h-8 items-center justify-center"
      >
        <Ionicons name="trash-outline" size={16} color="#6B7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { matches, loadMatches, deleteMatch } = useHistoryStore();
  const [filterSeasonId, setFilterSeasonId] = useState<string | null>(null);
  const seasons = getSeasons();

  useEffect(() => {
    loadMatches();
  }, []);

  const filtered = filterSeasonId
    ? matches.filter((m) => m.seasonId === filterSeasonId)
    : matches;

  // Stats
  const last10 = filtered.slice(0, 10);
  const avgScore =
    last10.length > 0
      ? Math.round(last10.reduce((sum, m) => sum + m.totalScore, 0) / last10.length)
      : 0;
  const bestMatch = filtered.length > 0 ? Math.max(...filtered.map((m) => m.totalScore)) : 0;
  const avgAuto =
    last10.length > 0
      ? Math.round(last10.reduce((sum, m) => sum + m.autoScore, 0) / last10.length)
      : 0;
  const avgTeleop =
    last10.length > 0
      ? Math.round(last10.reduce((sum, m) => sum + m.teleopScore, 0) / last10.length)
      : 0;

  const handleDelete = (id: string) => {
    Alert.alert('Delete Match', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMatch(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-[#F5F5F5] text-xl font-bold">Match History</Text>
      </View>

      {/* Stats summary */}
      {filtered.length > 0 && (
        <View className="mx-4 mb-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4">
          <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-2">
            LAST {last10.length} MATCHES
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-[#F5F5F5] text-xl font-bold">{avgScore}</Text>
              <Text className="text-[#9CA3AF] text-xs">Avg</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#F5F5F5] text-xl font-bold">{bestMatch}</Text>
              <Text className="text-[#9CA3AF] text-xs">Best</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#EF4444] text-xl font-bold">{avgAuto}</Text>
              <Text className="text-[#9CA3AF] text-xs">Avg Auto</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#22C55E] text-xl font-bold">{avgTeleop}</Text>
              <Text className="text-[#9CA3AF] text-xs">Avg Teleop</Text>
            </View>
          </View>
        </View>
      )}

      {/* Season filter */}
      <View className="px-4 mb-3">
        <FlatList
          data={[{ id: null, name: 'All Seasons' } as { id: string | null; name: string }, ...seasons.map((s) => ({ id: s.id, name: s.name }))]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id ?? 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilterSeasonId(item.id)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${
                filterSeasonId === item.id
                  ? 'bg-[#3B82F6] border-[#3B82F6]'
                  : 'bg-[#1A1A1A] border-[#2A2A2A]'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  filterSeasonId === item.id ? 'text-white' : 'text-[#9CA3AF]'
                }`}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="time-outline" size={48} color="#2A2A2A" />
          <Text className="text-[#9CA3AF] text-sm mt-3">No matches saved yet</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchCard match={item} onDelete={() => handleDelete(item.id)} />
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
