// components/ui/SeasonPicker.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSeasonStore } from "../../lib/store";
import THEME from "../../lib/theme";

export function SeasonPicker() {
  const { seasons, selectedSeasonId, setSelectedSeason } = useSeasonStore();
  const [open, setOpen] = React.useState(false);
  const selected = seasons.find((s) => s.id === selectedSeasonId);

  // Auto-select latest season on mount if nothing is selected
  useEffect(() => {
    if (seasons.length > 0 && !selectedSeasonId) {
      const latest = [...seasons].sort((a, b) => b.year - a.year)[0];
      setSelectedSeason(latest.id);
    }
  }, [seasons, selectedSeasonId, setSelectedSeason]);

  const latestYear =
    seasons.length > 0 ? Math.max(...seasons.map((s) => s.year)) : 0;
  const currentSeasons = seasons.filter((s) => s.year === latestYear);
  const legacySeasons = seasons.filter((s) => s.year < latestYear);

  const stripSuffix = (name: string) => name.replace(/\s*presented by.*/i, "");

  const displayName = selected ? stripSuffix(selected.name) : "Select season";

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center bg-surface border border-outline-variant rounded-xl px-3 py-2"
      >
        <Text className="text-on-surface text-sm flex-1" numberOfLines={1}>
          {displayName}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={THEME.colors.mutedIcon}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/60"
          onPress={() => setOpen(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4">
            <Text className="text-on-surface text-lg font-bold mb-3">
              Select Season
            </Text>
            <ScrollView>
              {/* Current seasons */}
              {currentSeasons.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="py-3 px-2 border-b border-outline-variant flex-row items-center justify-between"
                  onPress={() => {
                    setSelectedSeason(item.id);
                    setOpen(false);
                  }}
                >
                  <View>
                    <Text className="text-on-surface text-sm font-medium">
                      {stripSuffix(item.name)}
                    </Text>
                    <Text className="text-on-surface-variant text-xs">
                      {item.program} · {item.year}
                    </Text>
                  </View>
                  {item.id === selectedSeasonId && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={THEME.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* Legacy divider and seasons */}
              {legacySeasons.length > 0 && (
                <>
                  <View className="py-2 px-2 mt-1">
                    <Text className="text-on-surface-variant text-xs uppercase tracking-widest">
                      Legacy
                    </Text>
                  </View>
                  {legacySeasons.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className={`py-3 px-2 border-b ${THEME.classes.border2A} flex-row items-center justify-between`}
                      onPress={() => {
                        setSelectedSeason(item.id);
                        setOpen(false);
                      }}
                    >
                      <View>
                        <Text className="text-on-surface text-sm font-medium">
                          {stripSuffix(item.name)}
                        </Text>
                        <Text className="text-on-surface-variant text-xs">
                          {item.program} · {item.year}
                        </Text>
                      </View>
                      {item.id === selectedSeasonId && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={THEME.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
