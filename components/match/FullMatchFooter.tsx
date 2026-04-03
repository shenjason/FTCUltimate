import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue, ScoreMap } from "../../types/match";
import { useMatchStore } from "../../lib/store";
import FooterModule from "./FooterModule";
import THEME from "../../lib/theme";

interface FoulCounts {
  redMinor: number;
  redMajor: number;
  blueMinor: number;
  blueMajor: number;
}

interface FullMatchFooterProps {
  selectedModule: ModuleConfig | null;
  isFoulsSelected: boolean;
  redScores: ScoreMap;
  blueScores: ScoreMap;
  fouls: FoulCounts;
  onRedChange: (val: ScoreValue) => void;
  onBlueChange: (val: ScoreValue) => void;
  disabled: boolean;
}

function FoulsZone({
  alliance,
  fouls,
  disabled,
}: {
  alliance: "red" | "blue";
  fouls: FoulCounts;
  disabled: boolean;
}) {
  const { incrementFoul, decrementFoul } = useMatchStore();
  const isRed = alliance === "red";
  const majorCount = isRed ? fouls.redMajor : fouls.blueMajor;
  const minorCount = isRed ? fouls.redMinor : fouls.blueMinor;
  const labelColor = isRed ? "text-stitch-error" : "text-stitch-primary";
  const displayLabel = isRed ? "Red: Fouls" : "Blue: Fouls";

  return (
    <View
      className={`flex-1 flex-col justify-center px-4 ${
        isRed
          ? THEME.classes.footerRedBg + " border-r border-white/5"
          : THEME.classes.footerBlueBg
      }`}
    >
      <Text
        className={`text-[9px] uppercase font-bold tracking-[0.2em] ${labelColor} mb-2 ${
          isRed ? "" : "text-right"
        }`}
      >
        {displayLabel}
      </Text>
      <View className="flex-row gap-3">
        {/* Minor foul */}
        <View className="flex-1 items-center gap-1">
          <Text className="text-[8px] uppercase font-bold text-stitch-secondary">
            Minor
          </Text>
          <Text className="text-xl font-black text-stitch-secondary">
            {minorCount}
          </Text>
          <View className="flex-row gap-1">
            <TouchableOpacity
              onPress={() => decrementFoul(alliance, "minor")}
              disabled={disabled || minorCount <= 0}
              className="flex-1 bg-surface-container-highest rounded-lg py-1 items-center"
            >
              <Text className="text-on-surface text-sm">−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => incrementFoul(alliance, "minor")}
              disabled={disabled}
              className="flex-[2] bg-stitch-secondary rounded-lg py-1 items-center"
            >
              <Text className="text-on-stitch-error text-sm">+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Major foul */}
        <View className="flex-1 items-center gap-1">
          <Text className="text-[8px] uppercase font-bold text-stitch-error">
            Major
          </Text>
          <Text className="text-xl font-black text-stitch-error">
            {majorCount}
          </Text>
          <View className="flex-row gap-1">
            <TouchableOpacity
              onPress={() => decrementFoul(alliance, "major")}
              disabled={disabled || majorCount <= 0}
              className="flex-1 bg-surface-container-highest rounded-lg py-1 items-center"
            >
              <Text className="text-on-surface text-sm">−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => incrementFoul(alliance, "major")}
              disabled={disabled}
              className="flex-[2] bg-stitch-error rounded-lg py-1 items-center"
            >
              <Text className="text-on-stitch-error text-sm">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export function FullMatchFooter({
  selectedModule,
  isFoulsSelected,
  redScores,
  blueScores,
  fouls,
  onRedChange,
  onBlueChange,
  disabled,
}: FullMatchFooterProps) {
  if (isFoulsSelected) {
    return (
      <View className="h-36 flex-row border-t border-outline-variant/10">
        <FoulsZone alliance="red" fouls={fouls} disabled={disabled} />
        <FoulsZone alliance="blue" fouls={fouls} disabled={disabled} />
      </View>
    );
  }

  if (!selectedModule) {
    return (
      <View className="h-36 flex-row border-t border-outline-variant/10 items-center justify-center">
        <Text className="text-on-surface-variant text-sm">
          Select a module above
        </Text>
      </View>
    );
  }

  // Render selected module controls for both alliances via FooterModule
  if (selectedModule.type === "counter") {
    return (
      <View className="h-36 flex-row border-t border-outline-variant/10">
        <FooterModule
          module={selectedModule}
          value={(redScores[selectedModule.id] as number) ?? 0}
          onChange={(v) => onRedChange(v)}
          disabled={disabled}
          alliance="red"
          matchType="full"
        />
        <FooterModule
          module={selectedModule}
          value={(blueScores[selectedModule.id] as number) ?? 0}
          onChange={(v) => onBlueChange(v)}
          disabled={disabled}
          alliance="blue"
          matchType="full"
        />
      </View>
    );
  }

  // Fallback for non-counter module types
  return (
    <View className="h-36 flex-row border-t border-outline-variant/10">
      <FooterModule
        module={selectedModule}
        value={redScores[selectedModule.id]}
        onChange={onRedChange}
        disabled={disabled}
        alliance="red"
        matchType="full"
      />
      <FooterModule
        module={selectedModule}
        value={blueScores[selectedModule.id]}
        onChange={onBlueChange}
        disabled={disabled}
        alliance="blue"
        matchType="full"
      />
    </View>
  );
}
// FallbackControls replaced by FooterModule component
