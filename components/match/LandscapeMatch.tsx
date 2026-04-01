import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SeasonConfig, ModuleConfig } from "../../types/season";
import type { MatchType, MatchPhase, StartMode } from "../../types/match";
import { useMatchStore } from "../../lib/store";
import { useMatchTimer } from "../../hooks/useMatchTimer";
import { computeDualScore, computeScore } from "../../lib/scoreEngine";
import { LandscapeHeader } from "./LandscapeHeader";
import { BottomControlPanel } from "./BottomControlPanel";
import { FoulsPanel } from "./FoulsPanel";
import { GlassTimer } from "./GlassTimer";
import { AllianceModuleGrid, FOULS_MODULE_ID } from "./AllianceModuleGrid";
import { MatchActionBar } from "./MatchActionBar";
import { FullMatchFooter } from "./FullMatchFooter";
import { ModuleTile } from "./ModuleTile";

interface LandscapeMatchProps {
  season: SeasonConfig;
  matchType: MatchType;
  alliance: "blue" | "red";
  onMatchComplete: (scores: any) => void;
  onExit: () => void;
}

type ViewingPhase = 'auto' | 'teleop';

function canonicalPhase(phase: MatchPhase, startMode: StartMode): ViewingPhase {
  if (phase === 'pre_teleop' || phase === 'teleop' || phase === 'complete') return 'teleop';
  return 'auto'; // idle, pre_auto, auto, transition
}

function resolveModules(season: SeasonConfig, vp: ViewingPhase): ModuleConfig[] {
  return vp === 'auto' ? season.autonomous : season.teleop;
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

  const { displayTime, isPaused, start, pause, resume, reset } =
    useMatchTimer(season);

  const completeFiredRef = useRef(false);
  const justResetRef = useRef(false);
  const justResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSolo = matchType === "solo";

  // viewingPhase: which phase's modules the user is currently viewing/editing
  const [viewingPhase, setViewingPhase] = useState<ViewingPhase>(
    () => canonicalPhase(phase, startMode)
  );

  // Auto-sync viewingPhase when the real game phase transitions
  useEffect(() => {
    setViewingPhase(canonicalPhase(phase, startMode));
  }, [phase, startMode]);

  // Effective viewing phase for module resolution:
  // In idle, always show the starting phase's modules
  const effectiveViewingPhase: ViewingPhase =
    phase === 'idle'
      ? (startMode === 'teleop_only' ? 'teleop' : 'auto')
      : viewingPhase;

  const modules = resolveModules(season, effectiveViewingPhase);

  // Wrong-phase detection (only meaningful during active match)
  const matchIsActive =
    phase === 'auto' || phase === 'transition' || phase === 'teleop' ||
    phase === 'pre_auto' || phase === 'pre_teleop';
  const isWrongPhase = matchIsActive && viewingPhase !== canonicalPhase(phase, startMode);

  const disabled =
    phase === "complete" ||
    phase === "pre_auto" ||
    phase === "pre_teleop";
  // idle is intentionally excluded: modules are editable before match starts

  // Selects first module whenever the modules list changes (phase/viewingPhase switch).
  // Intentionally omits selectedModuleId/setSelectedModuleId from deps to avoid
  // re-entrancy — this effect must only fire when the modules array identity changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (modules.length === 0) return;
    const isValid =
      selectedModuleId !== null &&
      selectedModuleId !== FOULS_MODULE_ID &&
      modules.some((m) => m.id === selectedModuleId);
    if (!isValid) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules]);

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

  const handleSave = () => {};

  const handleToggleStartMode = () => {
    setStartMode(startMode === "auto_teleop" ? "teleop_only" : "auto_teleop");
  };

  const handleStartReset = () => {
    if (phase === "idle" || phase === "complete") {
      if (justResetRef.current) return;
      completeFiredRef.current = false;
      start();
    } else {
      justResetRef.current = true;
      if (justResetTimerRef.current) clearTimeout(justResetTimerRef.current);
      justResetTimerRef.current = setTimeout(() => {
        justResetRef.current = false;
      }, 300);
      reset();
    }
  };

  // ─── Solo Layout ───────────────────────────────────────────────────────────
  if (isSolo) {
    return (
      <SafeAreaView
        className="flex-1 flex-col"
        style={{ backgroundColor: "#0a0e16" }}
        edges={["left", "right"]}
      >
        <LandscapeHeader
          phase={phase}
          onExit={onExit}
          onSave={handleSave}
          saveEnabled={saveEnabled}
          startMode={startMode}
          onToggleStartMode={handleToggleStartMode}
          canChangeStartMode={canChangeStartMode}
          viewingPhase={effectiveViewingPhase}
          onSetViewingPhase={setViewingPhase}
          canToggleViewingPhase={matchIsActive}
        />

        {/* Content row: main area + action strip (full height) */}
        <View className="flex-1 flex-row overflow-hidden">
          {/* Main area: module grid row + footer */}
          <View className="flex-1 flex-col overflow-hidden">
            {/* Upper row: left grid (66.6%) + right panel (33.4%) */}
            <View className="flex-1 flex-row overflow-hidden">
              {/* Left 66.6%: scrollable 2-col module grid */}
              <View
                className="flex-col overflow-hidden border-r"
                style={{ width: "66.6%", borderColor: "#2A2A2A", backgroundColor: "#0a0e16" }}
              >
                <ScrollView
                  className="flex-1 p-4"
                  contentContainerStyle={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  {modules.map((mod) => (
                    <ModuleTile
                      key={mod.id}
                      module={mod}
                      value={scores[mod.id]}
                      isSelected={selectedModuleId === mod.id}
                      onPress={() => setSelectedModuleId(mod.id)}
                      disabled={disabled}
                      mode="solo"
                    />
                  ))}
                  {/* Fouls tile */}
                  <ModuleTile
                    module={
                      { id: FOULS_MODULE_ID, label: "Fouls", type: "boolean" } as ModuleConfig
                    }
                    value={null}
                    isSelected={isFoulsSelected}
                    onPress={() => setSelectedModuleId(FOULS_MODULE_ID)}
                    disabled={disabled}
                    mode="solo"
                    foulData={{
                      minor: alliance === "blue" ? fouls.blueMinor : fouls.redMinor,
                      major: alliance === "blue" ? fouls.blueMajor : fouls.redMajor,
                    }}
                  />
                </ScrollView>
              </View>

              {/* Right 33.4%: timer (top flex-1) + score (bottom h-[100px]) */}
              <View className="flex-1 flex-col">
                {/* Top: glass timer */}
                <View className="flex-1 items-center justify-center px-4">
                  <GlassTimer
                    displayTime={displayTime}
                    phase={phase}
                    isPaused={isPaused}
                    variant="solo"
                  />
                  {/* Start / Reset button */}
                  <TouchableOpacity
                    onPress={handleStartReset}
                    disabled={phase === 'pre_auto' || phase === 'pre_teleop'}
                    className="mt-3 bg-secondary px-6 py-2 rounded-lg"
                  >
                    <Text className="text-on-secondary font-bold text-sm">
                      {phase === "idle" || phase === "complete"
                        ? "▶  Start"
                        : "⟳  Reset"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom: big gold score */}
                <View
                  className="h-[100px] items-center justify-center border-t"
                  style={{ borderColor: "#2A2A2A" }}
                >
                  <Text
                    className="font-black text-secondary leading-none tracking-tighter"
                    style={{ fontSize: 56 }}
                  >
                    {blueScore}
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer: dynamic module controls */}
            <View
              className="h-[100px] shrink-0 border-t bg-surface-container-low flex-row items-stretch px-4"
              style={{ borderColor: "#2A2A2A" }}
            >
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
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-on-surface-variant text-sm">
                    Select a module above
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action strip: full height, far right */}
          <MatchActionBar
            isPaused={isPaused}
            phase={phase}
            onPauseResume={isPaused ? resume : pause}
            onReset={handleStartReset}
          />
        </View>

        {/* Wrong-phase editing vignette */}
        {isWrongPhase && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { borderWidth: 6, borderColor: 'rgba(239, 68, 68, 0.55)', zIndex: 999 },
            ]}
          />
        )}
      </SafeAreaView>
    );
  }

  // ─── Full Mode Layout ──────────────────────────────────────────────────────
  return (
    <SafeAreaView
      className="flex-1 flex-col"
      style={{ backgroundColor: "#0a0e16" }}
      edges={["left", "right"]}
    >
      <LandscapeHeader
        phase={phase}
        onExit={onExit}
        onSave={handleSave}
        saveEnabled={saveEnabled}
        startMode={startMode}
        onToggleStartMode={handleToggleStartMode}
        canChangeStartMode={canChangeStartMode}
        viewingPhase={effectiveViewingPhase}
        onSetViewingPhase={setViewingPhase}
        canToggleViewingPhase={matchIsActive}
      />

      {/* Content row: main area + action strip (full height) */}
      <View className="flex-1 flex-row overflow-hidden">
        {/* Main area: alliance columns + footer */}
        <View className="flex-1 flex-col overflow-hidden">
          {/* Upper row: Red | Center | Blue */}
          <View className="flex-1 flex-row overflow-hidden">
            {/* Red Alliance (fixed 240px) */}
            <View style={{ width: 240 }}>
              <AllianceModuleGrid
                alliance="red"
                modules={modules}
                scores={redScores}
                fouls={fouls}
                selectedModuleId={selectedModuleId}
                onSelectModule={setSelectedModuleId}
                disabled={disabled}
              />
            </View>

            {/* Center: Scores + Timer */}
            <View
              className="flex-1 flex-col items-center overflow-hidden px-2"
              style={{ backgroundColor: "rgba(15, 19, 29, 0.3)" }}
            >
              {/* Scores row */}
              <View className="w-full flex-row justify-between items-start mt-4">
                <View className="items-center">
                  <Text
                    className="font-black leading-none tracking-tighter text-stitch-error"
                    style={{ fontSize: 40 }}
                  >
                    {String(redScore).padStart(3, "0")}
                  </Text>
                  <Text className="text-[8px] uppercase text-stitch-error font-bold tracking-widest mt-1">
                    Red Score
                  </Text>
                </View>
                <View className="items-center">
                  <Text
                    className="font-black leading-none tracking-tighter text-stitch-primary"
                    style={{ fontSize: 40 }}
                  >
                    {String(blueScore).padStart(3, "0")}
                  </Text>
                  <Text className="text-[8px] uppercase text-stitch-primary font-bold tracking-widest mt-1">
                    Blue Score
                  </Text>
                </View>
              </View>

              {/* Timer + Start button centered */}
              <View className="flex-1 items-center justify-center gap-3">
                <TouchableOpacity
                  onPress={handleStartReset}
                  disabled={phase === 'pre_auto' || phase === 'pre_teleop'}
                  className="bg-stitch-secondary px-6 py-2 rounded-lg"
                >
                  <Text className="text-on-stitch-error font-bold text-base">
                    {phase === "idle" || phase === "complete"
                      ? "▶  Start"
                      : "⟳  Reset"}
                  </Text>
                </TouchableOpacity>
                <GlassTimer
                  displayTime={displayTime}
                  phase={phase}
                  isPaused={isPaused}
                  variant="full"
                />
              </View>
            </View>

            {/* Blue Alliance (fixed 240px) */}
            <View style={{ width: 240 }}>
              <AllianceModuleGrid
                alliance="blue"
                modules={modules}
                scores={scores}
                fouls={fouls}
                selectedModuleId={selectedModuleId}
                onSelectModule={setSelectedModuleId}
                disabled={disabled}
              />
            </View>
          </View>

          {/* Footer: only spans to the left of action strip */}
          <FullMatchFooter
            selectedModule={selectedModule ?? null}
            isFoulsSelected={isFoulsSelected}
            redScores={redScores}
            blueScores={scores}
            fouls={fouls}
            onRedChange={(val) =>
              selectedModule && setRedScore(selectedModule.id, val)
            }
            onBlueChange={(val) =>
              selectedModule && setScore(selectedModule.id, val)
            }
            disabled={disabled}
          />
        </View>

        {/* Action strip: full height on far right */}
        <MatchActionBar
          isPaused={isPaused}
          phase={phase}
          onPauseResume={isPaused ? resume : pause}
          onReset={handleStartReset}
        />
      </View>

      {/* Wrong-phase editing vignette */}
      {isWrongPhase && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { borderWidth: 6, borderColor: 'rgba(239, 68, 68, 0.55)', zIndex: 999 },
          ]}
        />
      )}
    </SafeAreaView>
  );
}
