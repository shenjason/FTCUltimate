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
  isFirst,
  onDelete,
}: {
  match: SavedMatch;
  isFirst: boolean;
  onDelete: () => void;
}) {
  const router = useRouter();
  const seasons = getSeasons();
  const season = seasons.find((s) => s.id === match.seasonId);
  const date = new Date(match.timestamp);
  const seasonDisplayName = season ? stripSuffix(season.name) : match.seasonId;
  const dateStr = `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/history/${match.id}`)}
      style={{
        backgroundColor: "#151a24",
        borderRadius: 12,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderLeftWidth: 4,
        borderLeftColor: isFirst ? "#84adff" : "transparent",
        marginBottom: 12,
      }}
    >
      {/* Left: info */}
      <View style={{ flex: 1, gap: 6 }}>
        <View>
          <Text
            style={{ color: "#e8eaf7", fontSize: 16, fontWeight: "700" }}
            numberOfLines={1}
          >
            {match.matchName ?? "Untitled Match"}{" "}
            <Text style={{ color: "#a8abb6", fontSize: 12, fontWeight: "400" }}>
              {dateStr}
            </Text>
          </Text>
          <Text
            style={{
              color: "#84adff",
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            {seasonDisplayName}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View
            style={{
              backgroundColor: "rgba(167,1,56,0.2)",
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#ff6e84", fontSize: 10, fontWeight: "700" }}>
              AUTO {match.autoScore}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(161,250,255,0.1)",
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#a1faff", fontSize: 10, fontWeight: "700" }}>
              TELEOP {match.teleopScore}
            </Text>
          </View>
        </View>
      </View>

      {/* Right: type badge + score */}
      <View style={{ alignItems: "flex-end", gap: 4, marginLeft: 12 }}>
        <MatchTypeBadge matchType={match.matchType} />
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              color: "#e8eaf7",
              fontSize: 30,
              fontWeight: "900",
              fontStyle: "italic",
              letterSpacing: -1,
            }}
          >
            {match.totalScore}
          </Text>
          <Text style={{ color: "#a8abb6", fontSize: 10, fontWeight: "700", marginLeft: 3 }}>
            pts
          </Text>
        </View>
      </View>

      {/* Delete button */}
      <TouchableOpacity
        onPress={onDelete}
        style={{ position: "absolute", top: 10, right: 10, padding: 4 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={14} color="#444852" />
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

  const last10 = filtered.slice(0, 10);
  const avgScore =
    last10.length > 0
      ? Math.round(last10.reduce((sum, m) => sum + m.totalScore, 0) / last10.length)
      : 0;
  const bestMatch =
    filtered.length > 0 ? Math.max(...filtered.map((m) => m.totalScore)) : 0;
  const avgAuto =
    last10.length > 0
      ? Math.round(last10.reduce((sum, m) => sum + m.autoScore, 0) / last10.length)
      : 0;
  const avgTeleop =
    last10.length > 0
      ? Math.round(last10.reduce((sum, m) => sum + m.teleopScore, 0) / last10.length)
      : 0;

  const handleSync = async () => {
    setSyncing(true);
    const result = await pushUnsyncedMatches();
    setSyncing(false);
    setUnsyncedCount(await getUnsyncedCount());

    if (result.errors.length > 0) {
      Alert.alert("Sync Partial", `Pushed ${result.pushed} matches.\n${result.errors.length} failed.`);
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

  const FilterPill = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 50,
        backgroundColor: active ? "#84adff" : "#202632",
        marginRight: 8,
      }}
    >
      <Text
        style={{
          color: active ? "#002d64" : "#a8abb6",
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0e16" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <Ionicons name="time" size={20} color="#84adff" style={{ marginRight: 10 }} />
        <Text
          style={{
            color: "#84adff",
            fontSize: 20,
            fontWeight: "700",
            letterSpacing: -0.5,
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          Match History
        </Text>
        <TouchableOpacity
          onPress={handleSync}
          disabled={syncing || unsyncedCount === 0}
          style={{ padding: 8 }}
        >
          <Ionicons
            name={syncing ? "sync" : "cloud-upload-outline"}
            size={20}
            color={unsyncedCount > 0 ? "#84adff" : "#444852"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => exportMatchesCSV(filtered)}
          disabled={filtered.length === 0}
          style={{ padding: 8 }}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color={filtered.length > 0 ? "#a1faff" : "#444852"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Stats hero */}
            {filtered.length > 0 && (
              <View
                style={{
                  backgroundColor: "#0f131d",
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 20,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#a8abb6",
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Last {last10.length} Matches
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(132,173,255,0.1)",
                      borderRadius: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: "#84adff",
                        fontSize: 9,
                        fontWeight: "700",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Performance Live
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1, alignItems: "flex-start" }}>
                    <Text style={{ color: "#e8eaf7", fontSize: 30, fontWeight: "700" }}>
                      {avgScore}
                    </Text>
                    <Text
                      style={{
                        color: "#a8abb6",
                        fontSize: 10,
                        fontWeight: "700",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Avg Score
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "flex-start",
                      borderLeftWidth: 1,
                      borderLeftColor: "rgba(68,72,82,0.3)",
                      paddingLeft: 16,
                    }}
                  >
                    <Text style={{ color: "#e8eaf7", fontSize: 30, fontWeight: "700" }}>
                      {bestMatch}
                    </Text>
                    <Text
                      style={{
                        color: "#a8abb6",
                        fontSize: 10,
                        fontWeight: "700",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Best
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "flex-start",
                      borderLeftWidth: 1,
                      borderLeftColor: "rgba(68,72,82,0.3)",
                      paddingLeft: 16,
                    }}
                  >
                    <Text style={{ color: "#ff6e84", fontSize: 30, fontWeight: "700" }}>
                      {avgAuto}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,110,132,0.7)",
                        fontSize: 10,
                        fontWeight: "700",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Avg Auto
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: "flex-start",
                      borderLeftWidth: 1,
                      borderLeftColor: "rgba(68,72,82,0.3)",
                      paddingLeft: 16,
                    }}
                  >
                    <Text style={{ color: "#a1faff", fontSize: 30, fontWeight: "700" }}>
                      {avgTeleop}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(161,250,255,0.7)",
                        fontSize: 10,
                        fontWeight: "700",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Avg Teleop
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Filters */}
            <View style={{ gap: 8, marginBottom: 20 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <FilterPill
                  label="All Seasons"
                  active={filterSeasonId === null}
                  onPress={() => setFilterSeasonId(null)}
                />
                {seasons.map((s) => (
                  <FilterPill
                    key={s.id}
                    label={stripSuffix(s.name)}
                    active={filterSeasonId === s.id}
                    onPress={() => setFilterSeasonId(s.id)}
                  />
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(["all", "solo", "full"] as const).map((type) => (
                  <FilterPill
                    key={type}
                    label={type === "all" ? "All Types" : type === "solo" ? "Solo" : "Full"}
                    active={matchTypeFilter === type}
                    onPress={() => setMatchTypeFilter(type)}
                  />
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(["all", "auto_teleop", "teleop_only"] as const).map((mode) => (
                  <FilterPill
                    key={mode}
                    label={
                      mode === "all"
                        ? "All Modes"
                        : mode === "auto_teleop"
                        ? "Auto + Teleop"
                        : "Teleop Only"
                    }
                    active={startModeFilter === mode}
                    onPress={() => setStartModeFilter(mode)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Feed header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  color: "rgba(232,234,247,0.5)",
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Verified Logs
              </Text>
              <Text style={{ color: "#a8abb6", fontSize: 10 }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
            <Ionicons name="time-outline" size={48} color="#202632" />
            <Text style={{ color: "#a8abb6", fontSize: 14, marginTop: 12 }}>
              No matches saved yet
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <MatchCard
            match={item}
            isFirst={index === 0}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}
