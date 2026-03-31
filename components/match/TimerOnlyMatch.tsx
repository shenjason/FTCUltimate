import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { SeasonConfig } from "../../types/season";
import { useMatchTimer } from "../../hooks/useMatchTimer";
import { useMatchStore } from "../../lib/store";
import { HamburgerMenu } from "./HamburgerMenu";

interface TimerOnlyMatchProps {
  season: SeasonConfig;
  onExit: () => void;
}

export function TimerOnlyMatch({ season, onExit }: TimerOnlyMatchProps) {
  const {
    displayTime,
    phase,
    isPaused,
    isCountingDown,
    countdownValue,
    start,
    pause,
    resume,
    reset,
  } = useMatchTimer(season);

  const { startMode, setStartMode } = useMatchStore();
  const timerStarted = phase !== "idle" && phase !== "complete";

  const handleToggleStartMode = () => {
    setStartMode(startMode === "auto_teleop" ? "teleop_only" : "auto_teleop");
  };

  const handleStartReset = () => {
    if (phase === "idle" || phase === "complete") {
      start();
    } else {
      reset();
    }
  };

  return (
    <View className="flex-1 bg-black items-center justify-center">
      {/* Top bar */}
      <View className="absolute top-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={handleStartReset}
          className="bg-[#B8860B] px-6 py-2 rounded-full"
        >
          <Text className="text-white font-bold text-base">
            {phase === "idle" || phase === "complete"
              ? `▶ Start ${startMode === "auto_teleop" ? "Auto" : "Teleop"}`
              : "⟳ Reset"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Start mode indicator (top right) */}
      <View className="absolute top-4 right-6">
        <Text
          className={`font-bold text-sm ${
            startMode === "auto_teleop" ? "text-auto" : "text-primary"
          }`}
        >
          {startMode === "auto_teleop" ? "Auto" : "No Auto"}
        </Text>
      </View>

      {/* Countdown or Timer */}
      {isCountingDown ? (
        <Text className="text-white text-[160px] font-black">
          {countdownValue}
        </Text>
      ) : (
        <Text className="text-white text-[160px] font-black tracking-tight">
          {displayTime}
        </Text>
      )}

      {/* Pause indicator */}
      {isPaused && (
        <TouchableOpacity onPress={resume}>
          <Text className="text-transition text-lg font-bold mt-2">
            PAUSED — tap to resume
          </Text>
        </TouchableOpacity>
      )}

      {/* Pause button (during active phases) */}
      {timerStarted && !isPaused && !isCountingDown && (
        <TouchableOpacity onPress={pause} className="mt-4">
          <Text className="text-text-secondary text-base">tap to pause</Text>
        </TouchableOpacity>
      )}

      {/* Bottom hamburger menu */}
      <View className="absolute bottom-6">
        <HamburgerMenu
          onExit={onExit}
          onSave={() => {}}
          saveEnabled={false}
          startMode={startMode}
          onToggleStartMode={handleToggleStartMode}
          canChangeStartMode={phase === "idle" || phase === "complete"}
        />
      </View>
    </View>
  );
}
