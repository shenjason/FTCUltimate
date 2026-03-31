// app/(tabs)/history/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistoryStore } from "../../../lib/store";
import { getSeasons } from "../../../lib/seasonLoader";
import type { SavedMatch } from "../../../types/match";
import { pushUnsyncedMatches, getUnsyncedCount } from "../../../lib/sync";
import { exportMatchesCSV } from "../../../lib/csvExport";
import { MatchTypeBadge } from "../../../components/ui/MatchTypeBadge";

const stripSuffix = (name: string) => name.replace(/\s*presented by.*/i, "");

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
  const seasonDisplayName = season ? stripSuffix(season.name) : match.seasonId;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/history/${match.id}`)}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 mb-3 mx-4"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text
              className="text-[#F5F5F5] font-semibold text-sm"
              numberOfLines={1}
            >
              {match.matchName ?? `Match #${match.matchNumber ?? "?"}`}
            </Text>
            <MatchTypeBadge matchType={match.matchType} />
          </View>
          <View className="flex-row items-center gap-2 mt-0.5 flex-wrap">
            <View className="bg-[#2A2A2A] px-2 py-0.5 rounded-full">
              <Text className="text-[#9CA3AF] text-xs" numberOfLines={1}>
                {seasonDisplayName}
              </Text>
            </View>
            <Text className="text-[#9CA3AF] text-xs">
              {date.toLocaleDateString()} ·{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[#F5F5F5] text-2xl font-bold">
            {match.totalScore}
          </Text>
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
          <Text className="text-[#9CA3AF] text-xs">
            TELEOP {match.teleopScore}
          </Text>
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
  const [matchTypeFilter, setMatchTypeFilter] = useState<"all" | "solo" | "full">("all");
  const [startModeFilter, setStartModeFilter] = useState<"all" | "auto_teleop" | "teleop_only">("all");
  const [unsyncedCount, setUnsyncedCount] = React.useState(0);
  const [syncing, setSyncing] = React.useState(false);
  const seasons = getSeasons();

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    getUnsyncedCount().then(setUnsyncedCount);
  }, [matches]);

  const filtered = matches.filter((m) => {
    if (filterSeasonId && m.seasonId !== filterSeasonId) return false;
    if (matchTypeFilter !== "all" && m.matchType !== matchTypeFilter) return false;
    if (startModeFilter !== "all" && m.startMode !== startModeFilter) return false;
    return true;
  });

  // Stats
  const last10 = filtered.slice(0, 10);
  const avgScore =
    last10.length > 0
      ? Math.round(
          last10.reduce((sum, m) => sum + m.totalScore, 0) / last10.length,
        )
      : 0;
  const bestMatch =
    filtered.length > 0 ? Math.max(...filtered.map((m) => m.totalScore)) : 0;
  const avgAuto =
    last10.length > 0
      ? Math.round(
          last10.reduce((sum, m) => sum + m.autoScore, 0) / last10.length,
        )
      : 0;
  const avgTeleop =
    last10.length > 0
      ? Math.round(
          last10.reduce((sum, m) => sum + m.teleopScore, 0) / last10.length,
        )
      : 0;

  const handleSync = async () => {
    setSyncing(true);
    const result = await pushUnsyncedMatches();
    setSyncing(false);
    setUnsyncedCount(await getUnsyncedCount());

    if (result.errors.length > 0) {
      Alert.alert(
        "Sync Partial",
        `Pushed ${result.pushed} matches.\n${result.errors.length} failed.`,
      );
    } else {
      Alert.alert("Synced", `${result.pushed} matches pushed to cloud.`);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Match", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMatch(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-[#F5F5F5] text-xl font-bold">Match History</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleSync}
            disabled={syncing || unsyncedCount === 0}
            className="flex-row items-center gap-1.5 bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded-full"
          >
            <Ionicons
              name={syncing ? "sync" : "cloud-upload-outline"}
              size={14}
              color={unsyncedCount > 0 ? "#3B82F6" : "#6B7280"}
            />
            {unsyncedCount > 0 && (
              <Text className="text-[#3B82F6] text-xs font-medium">
                {unsyncedCount}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => exportMatchesCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex-row items-center gap-1.5 bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1.5 rounded-full"
          >
            <Ionicons
              name="download-outline"
              size={14}
              color={filtered.length > 0 ? "#22C55E" : "#6B7280"}
            />
            <Text
              className={`text-xs font-medium ${filtered.length > 0 ? "text-[#22C55E]" : "text-[#6B7280]"}`}
            >
              CSV
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats summary */}
      {filtered.length > 0 && (
        <View className="mx-4 mb-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4">
          <Text className="text-[#9CA3AF] text-xs font-bold tracking-widest mb-2">
            LAST {last10.length} MATCHES
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-[#F5F5F5] text-xl font-bold">
                {avgScore}
              </Text>
              <Text className="text-[#9CA3AF] text-xs">Avg</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#F5F5F5] text-xl font-bold">
                {bestMatch}
              </Text>
              <Text className="text-[#9CA3AF] text-xs">Best</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#EF4444] text-xl font-bold">
                {avgAuto}
              </Text>
              <Text className="text-[#9CA3AF] text-xs">Avg Auto</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#22C55E] text-xl font-bold">
                {avgTeleop}
              </Text>
              <Text className="text-[#9CA3AF] text-xs">Avg Teleop</Text>
            </View>
          </View>
        </View>
      )}

      {/* Season filter */}
      <View className="mb-2">
        <FlatList
          data={[
            { id: null, name: "All Seasons" } as {
              id: string | null;
              name: string;
            },
            ...seasons.map((s) => ({ id: s.id, name: stripSuffix(s.name) })),
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id ?? "all"}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilterSeasonId(item.id)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${
                filterSeasonId === item.id
                  ? "bg-[#3B82F6] border-[#3B82F6]"
                  : "bg-[#1A1A1A] border-[#2A2A2A]"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  filterSeasonId === item.id ? "text-white" : "text-[#9CA3AF]"
                }`}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Match Type Filter */}
      <ScrollView horizontal className="mb-2" contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} showsHorizontalScrollIndicator={false}>
        {(["all", "solo", "full"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setMatchTypeFilter(type)}
            className={`px-3 py-1 rounded-full ${matchTypeFilter === type ? "bg-[#3B82F6]" : "bg-[#1A1A1A]"}`}
          >
            <Text className={`text-sm ${matchTypeFilter === type ? "text-white" : "text-[#9CA3AF]"}`}>
              {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Start Mode Filter */}
      <ScrollView horizontal className="mb-3" contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} showsHorizontalScrollIndicator={false}>
        {(["all", "auto_teleop", "teleop_only"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setStartModeFilter(mode)}
            className={`px-3 py-1 rounded-full ${startModeFilter === mode ? "bg-[#3B82F6]" : "bg-[#1A1A1A]"}`}
          >
            <Text className={`text-sm ${startModeFilter === mode ? "text-white" : "text-[#9CA3AF]"}`}>
              {mode === "all" ? "All Modes" : mode === "auto_teleop" ? "Auto + Teleop" : "Teleop Only"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="time-outline" size={48} color="#2A2A2A" />
          <Text className="text-[#9CA3AF] text-sm mt-3">
            No matches saved yet
          </Text>
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
