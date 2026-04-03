import React from "react";
import { View, Text } from "react-native";
import THEME from "../../lib/theme";
import { BounceButton } from "../ui/AnimatedPressable";
import type { SeasonConfig } from "../../types/season";
import { useMatchTimer } from "../../hooks/useMatchTimer";
import { useMatchStore } from "../../lib/store";
import { HamburgerMenu } from "./HamburgerMenu";
import { FlipTimeDisplay } from "../timer/FlipDigit";

interface TimerOnlyMatchProps {
  season: SeasonConfig;
  onExit: () => void;
}

export function TimerOnlyMatch({ season, onExit }: TimerOnlyMatchProps) {
  const { displayTime, phase, isPaused, start, pause, resume, reset } =
    useMatchTimer(season);

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
    <View className="flex-1 bg-surface-dim flex-row items-center justify-between px-8">
      {/* Left: controls */}
      <View className="items-center gap-3 w-40">
        <BounceButton
          onPress={handleStartReset}
          className="bg-stitch-secondary px-6 py-2 rounded-full"
        >
          <Text className="text-on-surface font-bold text-base">
            {phase === "idle" || phase === "complete"
              ? `▶ Start ${startMode === "auto_teleop" ? "Auto" : "Teleop"}`
              : "⟳ Reset"}
          </Text>
        </BounceButton>

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
        <FlipTimeDisplay
          displayTime={displayTime}
          fontSize={120}
          color={THEME.colors.currentValue}
        />

        {isPaused && (
          <BounceButton onPress={resume}>
            <Text className="text-transition text-lg font-bold mt-1">
              PAUSED — tap to resume
            </Text>
          </BounceButton>
        )}

        {timerStarted &&
          !isPaused &&
          phase !== "pre_auto" &&
          phase !== "pre_teleop" && (
            <BounceButton onPress={pause} className="mt-2">
              <Text className="text-text-secondary text-base">
                tap to pause
              </Text>
            </BounceButton>
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
