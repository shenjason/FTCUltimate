import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { MatchPhase, StartMode } from "../../types/match";
import { HamburgerMenu } from "./HamburgerMenu";
import { MaterialIcon } from "../ui/MaterialIcon";

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
  const isAuto =
    phase === "pre_auto" || phase === "auto" || phase === "transition";
  const isTeleop =
    phase === "pre_teleop" || phase === "teleop" || phase === "complete";

  return (
    <View
      className="flex-row items-center justify-between px-4 h-10 border-b border-outline-variant/10 bg-surface shrink-0"
      style={{ borderColor: "#2A2A2A" }}
    >
      {/* Left: Hamburger menu */}
      <View className="flex-row items-center gap-3">
        <HamburgerMenu
          onExit={onExit}
          onSave={onSave}
          saveEnabled={saveEnabled}
          startMode={startMode}
          onToggleStartMode={onToggleStartMode}
          canChangeStartMode={canChangeStartMode}
        />
      </View>

      {/* Center: AUTO/TELEOP pill toggle */}
      <View className="flex-row bg-surface-container rounded-full p-0.5 border border-outline-variant/30">
        <View
          className={`px-3 py-1 rounded-full ${isAuto ? "bg-stitch-primary" : ""}`}
        >
          <Text
            className={`text-[9px] font-bold uppercase tracking-widest ${
              isAuto ? "text-on-stitch-primary" : "text-on-surface-variant"
            }`}
          >
            Auto
          </Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${isTeleop ? "bg-stitch-primary" : ""}`}
        >
          <Text
            className={`text-[9px] font-bold uppercase tracking-widest ${
              isTeleop ? "text-on-stitch-primary" : "text-on-surface-variant"
            }`}
          >
            Teleop
          </Text>
        </View>
      </View>

      {/* Right: Close button */}
      <TouchableOpacity
        onPress={onExit}
        className="p-1 rounded-lg active:bg-surface-container-highest"
      >
        <MaterialIcon name="close" size={20} color="#84adff" />
      </TouchableOpacity>
    </View>
  );
}
