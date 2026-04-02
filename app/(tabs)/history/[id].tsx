// app/(tabs)/history/[id].tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistoryStore } from "../../../lib/store";
import { getSeasons } from "../../../lib/seasonLoader";
import { ModuleRenderer } from "../../../components/scoring/ModuleRenderer";
import type { ScoreMap, DualScoreMap } from "../../../types/match";
import { isDualScoreMap } from "../../../types/match";
import { MatchTypeBadge } from "../../../components/ui/MatchTypeBadge";

type Alliance = "blue" | "red";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { matches, deleteMatch } = useHistoryStore();
  const match = matches.find((m) => m.id === id);
  const [activeTab, setActiveTab] = useState<Alliance>("blue");

  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F0F] items-center justify-center">
        <Text className="text-[#9CA3AF]">Match not found</Text>
      </SafeAreaView>
    );
  }

  const seasons = getSeasons();
  const season = seasons.find((s) => s.id === match.seasonId);
  const date = new Date(match.timestamp);
  const isFull = isDualScoreMap(match.allScores);

  // Scores for the current view — always a plain ScoreMap for ModuleRenderer
  const activeScores: ScoreMap = isFull
    ? (match.allScores as DualScoreMap)[activeTab]
    : (match.allScores as ScoreMap);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-[#2A2A2A]">
        <TouchableOpacity onPress={() => router.replace("/history")} className="mr-3">
          <Ionicons name="arrow-back" size={22} color="#F5F5F5" />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-[#F5F5F5] font-bold text-base flex-shrink"
              numberOfLines={1}
            >
              {season?.name ?? match.seasonId}
            </Text>
            <MatchTypeBadge matchType={match.matchType} />
          </View>
          <Text className="text-[#9CA3AF] text-xs">
            {date.toLocaleDateString()} ·{" "}
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[#F5F5F5] text-2xl font-bold">
            {match.totalScore}
          </Text>
          <Text className="text-[#9CA3AF] text-xs">pts</Text>
        </View>
      </View>

      {/* Alliance tab bar — only shown for Full mode */}
      {isFull && (
        <View className="flex-row mx-4 mt-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("blue")}
            className={`flex-1 items-center py-2 rounded-lg ${
              activeTab === "blue" ? "bg-[#1D4ED8]" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold tracking-wide ${
                activeTab === "blue" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              BLUE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("red")}
            className={`flex-1 items-center py-2 rounded-lg ${
              activeTab === "red" ? "bg-[#B91C1C]" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold tracking-wide ${
                activeTab === "red" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              RED
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
      >
        {/* Score breakdown */}
        <View className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 mb-4 flex-row justify-around">
          <View className="items-center">
            <Text className="text-[#EF4444] text-xl font-bold">
              {match.autoScore}
            </Text>
            <Text className="text-[#9CA3AF] text-xs">Auto</Text>
          </View>
          <View className="w-px bg-[#2A2A2A]" />
          <View className="items-center">
            <Text className="text-[#22C55E] text-xl font-bold">
              {match.teleopScore}
            </Text>
            <Text className="text-[#9CA3AF] text-xs">Teleop</Text>
          </View>
          <View className="w-px bg-[#2A2A2A]" />
          <View className="items-center">
            <Text className="text-[#F5F5F5] text-xl font-bold">
              {match.totalScore}
            </Text>
            <Text className="text-[#9CA3AF] text-xs">Total</Text>
          </View>
        </View>

        {/* Auto modules (read-only) */}
        <Text className="text-[#EF4444] text-xs font-bold tracking-widest mb-2">
          ─ AUTONOMOUS
        </Text>
        {(season?.autonomous ?? []).map((module) => (
          <ModuleRenderer
            key={module.id}
            module={module}
            scores={activeScores}
            onChangeScore={() => {}}
            disabled={true}
            period="auto"
          />
        ))}

        <View className="h-px bg-[#2A2A2A] my-4" />

        {/* Teleop modules (read-only) */}
        <Text className="text-[#22C55E] text-xs font-bold tracking-widest mb-2">
          ─ TELEOP
        </Text>
        {(season?.teleop ?? []).map((module) => (
          <ModuleRenderer
            key={module.id}
            module={module}
            scores={activeScores}
            onChangeScore={() => {}}
            disabled={true}
            period="teleop"
          />
        ))}

        <View className="h-px bg-[#2A2A2A] my-4" />

        {/* Delete match */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Delete Match", "Are you sure? This cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  await deleteMatch(match.id);
                  router.replace("/history");
                },
              },
            ])
          }
          className="bg-[#7F1D1D] border border-[#991B1B] rounded-xl py-3 items-center mb-4"
        >
          <Text className="text-[#FCA5A5] font-bold text-sm">Delete Match</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
