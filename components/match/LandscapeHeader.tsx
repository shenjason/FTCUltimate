import React from "react";
import { View, Text } from "react-native";
import type { MatchPhase, StartMode } from "../../types/match";
import { HamburgerMenu } from "./HamburgerMenu";

interface LandscapeHeaderProps {
  phase: MatchPhase;
  onExit: () => void;
  onSave: () => void;
  saveEnabled: boolean;
  startMode: StartMode;
  onToggleStartMode: () => void;
  canChangeStartMode: boolean;
}

export function LandscapeHeader({
  phase,
  onExit,
  onSave,
  saveEnabled,
  startMode,
  onToggleStartMode,
  canChangeStartMode,
}: LandscapeHeaderProps) {
  const isAuto = phase === "auto" || phase === "transition";
  const isTeleop = phase === "teleop" || phase === "complete";

  return (
    <View className="flex-row items-center px-3 py-2 border-b border-border gap-3">
      <HamburgerMenu
        onExit={onExit}
        onSave={onSave}
        saveEnabled={saveEnabled}
        startMode={startMode}
        onToggleStartMode={onToggleStartMode}
        canChangeStartMode={canChangeStartMode}
      />

      <Text className="text-text-primary text-base font-bold">Stage</Text>

      {/* Phase tabs */}
      <View className="flex-row bg-surface rounded-md overflow-hidden">
        <View
          className={`px-3 py-1 ${isAuto ? "bg-text-secondary" : ""}`}
        >
          <Text
            className={`text-xs font-semibold ${
              isAuto ? "text-white" : "text-text-secondary"
            }`}
          >
            Auto
          </Text>
        </View>
        <View
          className={`px-3 py-1 ${isTeleop ? "bg-text-secondary" : ""}`}
        >
          <Text
            className={`text-xs font-semibold ${
              isTeleop ? "text-white" : "text-text-secondary"
            }`}
          >
            Teleop
          </Text>
        </View>
      </View>

      <View className="flex-1" />
    </View>
  );
}
