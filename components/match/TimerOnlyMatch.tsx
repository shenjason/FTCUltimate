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
    <View className="flex-1 bg-black flex-row items-center justify-between px-8">
      {/* Left: controls */}
      <View className="items-center gap-3 w-40">
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

        <Text
          className={`font-bold text-sm ${
            startMode === "auto_teleop" ? "text-auto" : "text-primary"
          }`}
        >
          {startMode === "auto_teleop" ? "Auto" : "No Auto"}
        </Text>
      </View>

      {/* Center: timer + pause */}
      <View className="items-center flex-1">
        <Text className="text-white text-[120px] font-black tracking-tight">
          {displayTime}
        </Text>

        {isPaused && (
          <TouchableOpacity onPress={resume}>
            <Text className="text-transition text-lg font-bold mt-1">
              PAUSED — tap to resume
            </Text>
          </TouchableOpacity>
        )}

        {timerStarted && !isPaused && phase !== 'pre_auto' && phase !== 'pre_teleop' && (
          <TouchableOpacity onPress={pause} className="mt-2">
            <Text className="text-text-secondary text-base">tap to pause</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Right: hamburger menu */}
      <View className="items-center w-40">
        <HamburgerMenu
          onExit={onExit}
          onSave={() => {}}
          saveEnabled={false}
          showSave={false}
          startMode={startMode}
          onToggleStartMode={handleToggleStartMode}
          canChangeStartMode={phase === "idle" || phase === "complete"}
        />
      </View>
    </View>
  );
}
