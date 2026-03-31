import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SeasonConfig, ModuleConfig } from "../../types/season";
import type { MatchType, MatchPhase } from "../../types/match";
import { useMatchStore } from "../../lib/store";
import { useMatchTimer } from "../../hooks/useMatchTimer";
import { computeDualScore, computeScore } from "../../lib/scoreEngine";
import { LandscapeHeader } from "./LandscapeHeader";
import { ModuleToggleButton } from "./ModuleToggleButton";
import { BottomControlPanel } from "./BottomControlPanel";
import { FoulsPanel } from "./FoulsPanel";

interface LandscapeMatchProps {
  season: SeasonConfig;
  matchType: MatchType;
  alliance: "blue" | "red";
  onMatchComplete: (scores: any) => void;
  onExit: () => void;
}

const FOULS_MODULE_ID = "__fouls__";

function resolveModules(
  season: SeasonConfig,
  phase: MatchPhase
): ModuleConfig[] {
  if (phase === "auto" || phase === "transition") return season.autonomous;
  if (phase === "teleop" || phase === "complete") return season.teleop;
  return [];
}

export function LandscapeMatch({
  season,
  matchType,
  alliance,
  onMatchComplete,
  onExit,
}: LandscapeMatchProps) {
  const {
    phase,
    scores,
    redScores,
    startMode,
    setStartMode,
    selectedModuleId,
    setSelectedModuleId,
    setScore,
    setRedScore,
    fouls,
  } = useMatchStore();

  const {
    displayTime,
    isPaused,
    start,
    resume,
    reset,
  } = useMatchTimer(season);

  const completeFiredRef = useRef(false);
  const justResetRef = useRef(false); // guards against double-fire on reset (TouchableOpacity re-render race)
  const isSolo = matchType === "solo";
  const disabled = phase === "idle" || phase === "complete" || phase === "pre_auto" || phase === "pre_teleop";
  const modules = resolveModules(season, phase);

  // Auto-select first module when modules change (phase change)
  useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId, setSelectedModuleId]);

  // Reset selectedModuleId when phase changes and current selection is invalid
  useEffect(() => {
    if (
      selectedModuleId &&
      selectedModuleId !== FOULS_MODULE_ID &&
      !modules.find((m) => m.id === selectedModuleId)
    ) {
      setSelectedModuleId(modules.length > 0 ? modules[0].id : null);
    }
  }, [modules, selectedModuleId, setSelectedModuleId]);

  // Fire completion callback
  useEffect(() => {
    if (phase === "complete" && !completeFiredRef.current) {
      completeFiredRef.current = true;
      setTimeout(() => {
        if (isSolo) {
          const result = computeScore(season, scores);
          onMatchComplete({
            scores,
            fouls,
            totalScore: result.total,
            autoScore: result.auto,
            teleopScore: result.teleop,
          });
        } else {
          const result = computeDualScore(season, scores, redScores, fouls);
          onMatchComplete({
            scores,
            redScores,
            fouls,
            blue: result.blue,
            red: result.red,
          });
        }
      }, 500);
    }
  }, [phase]);

  // Compute current scores
  const blueScore = isSolo
    ? computeScore(season, scores).total
    : computeDualScore(season, scores, redScores, fouls).blue.total;
  const redScore = isSolo
    ? 0
    : computeDualScore(season, scores, redScores, fouls).red.total;

  const selectedModule = modules.find((m) => m.id === selectedModuleId);
  const isFoulsSelected = selectedModuleId === FOULS_MODULE_ID;
  const canChangeStartMode = phase === "idle" || phase === "complete";
  const saveEnabled = phase === "complete";

  const handleSave = () => {
    // Save handled by onMatchComplete callback
  };

  const handleToggleStartMode = () => {
    setStartMode(startMode === "auto_teleop" ? "teleop_only" : "auto_teleop");
  };

  const handleStartReset = () => {
    if (phase === "idle" || phase === "complete") {
      if (justResetRef.current) { justResetRef.current = false; return; }
      completeFiredRef.current = false;
      start();
    } else {
      justResetRef.current = true;
      reset();
    }
  };

  if (isSolo) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["left", "right"]}>
        <LandscapeHeader
          phase={phase}
          onExit={onExit}
          onSave={handleSave}
          saveEnabled={saveEnabled}
          startMode={startMode}
          onToggleStartMode={handleToggleStartMode}
          canChangeStartMode={canChangeStartMode}
        />

        <View className="flex-1">
          {/* Module toggle buttons (top, wrapping) */}
          <ScrollView className="p-2" contentContainerClassName="flex-row flex-wrap gap-2">
            {modules.map((mod) => (
              <ModuleToggleButton
                key={mod.id}
                module={mod}
                isSelected={selectedModuleId === mod.id}
                onPress={() => setSelectedModuleId(mod.id)}
                scores={scores}
                disabled={disabled}
              />
            ))}
            {/* Fouls toggle */}
            <TouchableOpacity
              onPress={() => setSelectedModuleId(FOULS_MODULE_ID)}
              className={`flex-row items-center px-3 py-2 rounded-lg ${
                isFoulsSelected
                  ? "bg-white border-2 border-white"
                  : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  isFoulsSelected ? "text-black" : "text-text-primary"
                }`}
              >
                Fouls
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom section */}
          <View className="flex-row h-36">
            {/* Module controls (bottom-left) */}
            <View className="flex-1 bg-surface/50 p-2">
              {isFoulsSelected ? (
                <FoulsPanel alliance={alliance} disabled={disabled} />
              ) : selectedModule ? (
                <BottomControlPanel
                  module={selectedModule}
                  value={scores[selectedModule.id]}
                  onChange={(val) => setScore(selectedModule.id, val)}
                  alliance={alliance}
                  disabled={disabled}
                />
              ) : null}
            </View>

            {/* Timer + Score (bottom-right) */}
            <View className="w-52 p-2 gap-1">
              <TouchableOpacity
                onPress={handleStartReset}
                className="bg-[#B8860B] py-2 rounded-lg"
              >
                <Text className="text-white font-bold text-center">
                  {phase === "idle" || phase === "complete" ? "▶ Start" : "⟳ Reset"}
                </Text>
              </TouchableOpacity>

              <View className="flex-1 flex-row gap-1">
                {/* Timer */}
                <View className="flex-1 bg-white rounded-lg items-center justify-center">
                  <Text className="text-black text-3xl font-bold font-mono">
                    {displayTime}
                  </Text>
                  {isPaused && (
                    <TouchableOpacity onPress={resume}>
                      <Text className="text-transition text-xs">PAUSED</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {/* Score */}
                <View
                  className={`w-16 rounded-lg items-center justify-center ${
                    alliance === "blue" ? "bg-primary" : "bg-auto"
                  }`}
                >
                  <Text className="text-white text-2xl font-black">
                    {blueScore}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Full mode
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["left", "right"]}>
      <LandscapeHeader
        phase={phase}
        onExit={onExit}
        onSave={handleSave}
        saveEnabled={saveEnabled}
        startMode={startMode}
        onToggleStartMode={handleToggleStartMode}
        canChangeStartMode={canChangeStartMode}
      />

      <View className="flex-1 flex-row">
        {/* Left column: Red alliance modules */}
        <ScrollView className="flex-1 p-1" contentContainerClassName="gap-1">
          {modules.map((mod) => (
            <ModuleToggleButton
              key={mod.id}
              module={mod}
              isSelected={selectedModuleId === mod.id}
              onPress={() => setSelectedModuleId(mod.id)}
              scores={scores}
              redScores={redScores}
              showBothAlliances
              disabled={disabled}
            />
          ))}
          <TouchableOpacity
            onPress={() => setSelectedModuleId(FOULS_MODULE_ID)}
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              isFoulsSelected
                ? "bg-white border-2 border-white"
                : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                isFoulsSelected ? "text-black" : "text-text-primary"
              }`}
            >
              Fouls
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Center column: Season name + Timer + Scores */}
        <View className="w-48 items-center justify-between py-2">
          {/* Season name placeholder */}
          <View className="w-24 h-24 bg-surface rounded-xl items-center justify-center border border-border">
            <Text className="text-text-secondary text-xs text-center">
              {season.name.replace(/\s*presented by.*/i, "")}
            </Text>
          </View>

          {/* Start/Reset + Timer */}
          <View className="items-center gap-2">
            <TouchableOpacity
              onPress={handleStartReset}
              className="bg-[#B8860B] px-6 py-2 rounded-full"
            >
              <Text className="text-white font-bold">
                {phase === "idle" || phase === "complete" ? "▶ Start" : "⟳ Reset"}
              </Text>
            </TouchableOpacity>

            <View className="bg-white px-6 py-2 rounded-full">
              <Text className="text-black text-2xl font-bold font-mono">
                {displayTime}
              </Text>
            </View>

            {isPaused && (
              <TouchableOpacity onPress={resume}>
                <Text className="text-transition text-xs font-bold">
                  PAUSED
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Scores */}
          <View className="flex-row gap-2 w-full px-2">
            <View className="flex-1 bg-auto rounded-xl py-2 items-center">
              <Text className="text-white text-2xl font-black">{redScore}</Text>
            </View>
            <View className="flex-1 bg-primary rounded-xl py-2 items-center">
              <Text className="text-white text-2xl font-black">
                {blueScore}
              </Text>
            </View>
          </View>
        </View>

        {/* Right column: Blue alliance modules */}
        <ScrollView className="flex-1 p-1" contentContainerClassName="gap-1">
          {modules.map((mod) => (
            <ModuleToggleButton
              key={mod.id}
              module={mod}
              isSelected={selectedModuleId === mod.id}
              onPress={() => setSelectedModuleId(mod.id)}
              scores={scores}
              redScores={redScores}
              showBothAlliances
              disabled={disabled}
            />
          ))}
          <TouchableOpacity
            onPress={() => setSelectedModuleId(FOULS_MODULE_ID)}
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              isFoulsSelected
                ? "bg-white border-2 border-white"
                : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                isFoulsSelected ? "text-black" : "text-text-primary"
              }`}
            >
              Fouls
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bottom control panels */}
      <View className="flex-row h-28">
        {/* Red controls (bottom-left) */}
        <View className="flex-1">
          {isFoulsSelected ? (
            <FoulsPanel alliance="red" disabled={disabled} />
          ) : selectedModule ? (
            <BottomControlPanel
              module={selectedModule}
              value={redScores[selectedModule.id]}
              onChange={(val) => setRedScore(selectedModule.id, val)}
              alliance="red"
              disabled={disabled}
            />
          ) : null}
        </View>

        {/* Spacer for center column */}
        <View className="w-48" />

        {/* Blue controls (bottom-right) */}
        <View className="flex-1">
          {isFoulsSelected ? (
            <FoulsPanel alliance="blue" disabled={disabled} />
          ) : selectedModule ? (
            <BottomControlPanel
              module={selectedModule}
              value={scores[selectedModule.id]}
              onChange={(val) => setScore(selectedModule.id, val)}
              alliance="blue"
              disabled={disabled}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
