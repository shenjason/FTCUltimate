// app/(tabs)/history/[id].tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistoryStore } from "../../../lib/store";
import { getSeasons } from "../../../lib/seasonLoader";
import THEME from "../../../lib/theme";
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
      <SafeAreaView className="flex-1 bg-surface-dim items-center justify-center">
        <Text className="text-on-surface-variant">Match not found</Text>
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
    <SafeAreaView className="flex-1 bg-surface-dim">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-outline-variant/10">
        <TouchableOpacity
          onPress={() => router.replace("/history")}
          className="mr-3"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={THEME.colors.currentValue}
          />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-on-surface font-bold text-base flex-shrink"
              numberOfLines={1}
            >
              {season?.name ?? match.seasonId}
            </Text>
            <MatchTypeBadge matchType={match.matchType} />
          </View>
          <Text className="text-on-surface-variant text-xs">
            {date.toLocaleDateString()} ·{" "}
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-on-surface text-2xl font-bold">
            {match.totalScore}
          </Text>
          <Text className="text-on-surface-variant text-xs">pts</Text>
        </View>
      </View>

      {/* Alliance tab bar — only shown for Full mode */}
      {isFull && (
        <View className="flex-row mx-4 mt-3 bg-surface border border-outline-variant rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("blue")}
            className={`flex-1 items-center py-2 rounded-lg ${
              activeTab === "blue" ? "bg-stitch-primary" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold tracking-wide ${
                activeTab === "blue" ? "text-white" : "text-on-surface-variant"
              }`}
            >
              BLUE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("red")}
            className={`flex-1 items-center py-2 rounded-lg ${
              activeTab === "red" ? "bg-stitch-error" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold tracking-wide ${
                activeTab === "red" ? "text-white" : "text-on-surface-variant"
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
        <View className="bg-surface border border-outline-variant rounded-2xl p-4 mb-4 flex-row justify-around">
          <View className="items-center">
            <Text className="text-auto text-xl font-bold">
              {match.autoScore}
            </Text>
            <Text className="text-on-surface-variant text-xs">Auto</Text>
          </View>
          <View className="w-px bg-outline-variant" />
          <View className="items-center">
            <Text className="text-teleop text-xl font-bold">
              {match.teleopScore}
            </Text>
            <Text className="text-on-surface-variant text-xs">Teleop</Text>
          </View>
          <View className="w-px bg-outline-variant" />
          <View className="items-center">
            <Text className="text-on-surface text-xl font-bold">
              {match.totalScore}
            </Text>
            <Text className="text-on-surface-variant text-xs">Total</Text>
          </View>
        </View>

        {/* Auto modules (read-only) */}
        <Text className="text-auto text-xs font-bold tracking-widest mb-2">
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

        <View className="h-px bg-outline-variant my-4" />

        {/* Teleop modules (read-only) */}
        <Text className="text-teleop text-xs font-bold tracking-widest mb-2">
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

        <View className="h-px bg-outline-variant my-4" />

        {/* Delete match */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Delete Match",
              "Are you sure? This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await deleteMatch(match.id);
                    router.replace("/history");
                  },
                },
              ],
            )
          }
          className="bg-error-container border border-error-container rounded-xl py-3 items-center mb-4"
        >
          <Text className="text-on-error-container font-bold text-sm">
            Delete Match
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
