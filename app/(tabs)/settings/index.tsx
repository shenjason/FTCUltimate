// app/(tabs)/settings/index.tsx
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type SettingsRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
};

const SETTINGS_ROWS: SettingsRow[] = [
  { icon: "trophy-outline", label: "Active Season", value: "FTC 2025 DECODE" },
  { icon: "cloud-outline", label: "Cloud Sync", value: "Enabled" },
  { icon: "information-circle-outline", label: "App Version", value: "1.0.0" },
];

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0a0e16]">
      <View className="flex-row items-center px-6 pt-4 pb-2 gap-3">
        <Ionicons name="settings" size={22} color="#84adff" />
        <Text
          style={{ color: "#84adff", fontSize: 20, fontWeight: "700", letterSpacing: -0.5, textTransform: "uppercase" }}
        >
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 mt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <View
          style={{ backgroundColor: "#0f131d", borderRadius: 12, overflow: "hidden" }}
        >
          {SETTINGS_ROWS.map((row, index) => (
            <React.Fragment key={row.label}>
              {index > 0 && (
                <View style={{ height: 1, backgroundColor: "#202632", marginLeft: 52 }} />
              )}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "#202632",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={row.icon} size={18} color="#84adff" />
                </View>
                <Text
                  style={{ flex: 1, color: "#e8eaf7", fontSize: 15, fontWeight: "500" }}
                >
                  {row.label}
                </Text>
                {row.value && (
                  <Text style={{ color: "#a8abb6", fontSize: 14 }}>{row.value}</Text>
                )}
                <Ionicons name="chevron-forward" size={16} color="#444852" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
