import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { MatchPhase } from "../../types/match";
import { MaterialIcon } from "../ui/MaterialIcon";

interface MatchActionBarProps {
  isPaused: boolean;
  phase: MatchPhase;
  onPauseResume: () => void;
  onReset: () => void;
}

const ACTIVE_PHASES: MatchPhase[] = ["auto", "transition", "teleop"];

export function MatchActionBar({
  isPaused,
  phase,
  onPauseResume,
  onReset,
}: MatchActionBarProps) {
  const isActive = ACTIVE_PHASES.includes(phase);

  return (
    <View
      className="w-16 border-l border-outline-variant/10 flex-col p-1.5 bg-surface-container-low/50 shrink-0 gap-1.5"
      style={{ borderColor: "#2A2A2A" }}
    >
      <TouchableOpacity
        onPress={onPauseResume}
        disabled={!isActive}
        className={`flex-[3] flex-col items-center justify-center rounded-lg ${
          isActive
            ? "bg-secondary-container border border-secondary/20"
            : "bg-surface-container opacity-40"
        }`}
      >
        <MaterialIcon
          name={isPaused ? "play_arrow" : "pause"}
          size={20}
          color={isActive ? "#fdc003" : "#a8abb6"}
        />
        <Text className="text-[8px] font-bold uppercase mt-1.5 tracking-tighter text-secondary">
          {isPaused ? "Resume" : "Pause"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReset}
        className="flex-[2] flex-col items-center justify-center rounded-lg bg-surface-container-highest/80 border border-secondary/20"
      >
        <MaterialIcon name="restart_alt" size={18} color="#fdc003" />
        <Text className="text-[8px] font-bold uppercase mt-1 tracking-tighter text-secondary">
          Reset
        </Text>
      </TouchableOpacity>
    </View>
  );
}
