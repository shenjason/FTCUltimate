// components/match/AlliancePanel.tsx
import React from "react";
import { View, ScrollView } from "react-native";
import { ModuleRenderer } from "../scoring/ModuleRenderer";
import THEME from "../../lib/theme";
import type { SeasonConfig } from "../../types/season";
import type { ScoreMap, ScoreValue, MatchPhase } from "../../types/match";

interface AlliancePanelProps {
  alliance: "red" | "blue";
  season: SeasonConfig;
  scores: ScoreMap;
  onChangeScore: (moduleId: string, value: ScoreValue) => void;
  disabled: boolean;
  currentPhase: MatchPhase;
}

/**
 * Determines which module period to render based on the current match phase.
 * auto/transition → show autonomous modules
 * teleop/complete → show teleop modules
 */
function resolveModulePeriod(phase: MatchPhase): "auto" | "teleop" | null {
  if (phase === "auto" || phase === "transition") return "auto";
  if (phase === "teleop" || phase === "complete") return "teleop";
  return null; // idle — nothing to show
}

export function AlliancePanel({
  alliance,
  season,
  scores,
  onChangeScore,
  disabled,
  currentPhase,
}: AlliancePanelProps) {
  const modulePeriod = resolveModulePeriod(currentPhase);

  const bgColor =
    alliance === "blue"
      ? THEME.classes.footerBlueBg
      : THEME.classes.footerRedBg;

  // Select the right module list based on phase
  const modules =
    modulePeriod === "auto"
      ? season.autonomous
      : modulePeriod === "teleop"
        ? season.teleop
        : [];

  return (
    <View className={`flex-1 ${bgColor}`}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 4 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {modules.map((mod) => (
          <ModuleRenderer
            key={mod.id}
            module={mod}
            scores={scores}
            onChangeScore={onChangeScore}
            disabled={disabled}
            period={modulePeriod ?? "auto"}
            variant="compact"
            alliance={alliance}
          />
        ))}
      </ScrollView>
    </View>
  );
}
