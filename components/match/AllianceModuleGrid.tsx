import React from "react";
import { View, Text, ScrollView } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreMap } from "../../types/match";
import { ModuleTile } from "./ModuleTile";
import THEME from "../../lib/theme";

export const FOULS_MODULE_ID = "__fouls__";

interface FoulCounts {
  redMinor: number;
  redMajor: number;
  blueMinor: number;
  blueMajor: number;
}

interface AllianceModuleGridProps {
  alliance: "red" | "blue";
  modules: ModuleConfig[];
  scores: ScoreMap;
  fouls: FoulCounts;
  selectedModuleId: string | null;
  onSelectModule: (id: string) => void;
  disabled: boolean;
}

export const AllianceModuleGrid = React.memo(function AllianceModuleGrid({
  alliance,
  modules,
  scores,
  fouls,
  selectedModuleId,
  onSelectModule,
  disabled,
}: AllianceModuleGridProps) {
  const isRed = alliance === "red";

  const headerBg = isRed
    ? "border-b border-stitch-error/20 bg-stitch-error/5"
    : "border-b border-stitch-primary/20 bg-stitch-primary/5";
  const headerColor = isRed ? "text-stitch-error" : "text-stitch-primary";
  const headerLabel = isRed ? "Red Alliance" : "Blue Alliance";
  const containerBg = isRed
    ? THEME.classes.footerRedBg
    : THEME.classes.footerBlueBg;

  const minorCount = isRed ? fouls.redMinor : fouls.blueMinor;
  const majorCount = isRed ? fouls.redMajor : fouls.blueMajor;

  return (
    <View className={`flex-1 ${containerBg} flex-col`}>
      <View className={`p-2 ${headerBg}`}>
        <Text
          className={`font-bold text-[10px] uppercase tracking-tight ${headerColor} ${
            isRed ? "" : "text-right"
          }`}
        >
          {headerLabel}
        </Text>
      </View>
      <ScrollView
        className="flex-1 p-2"
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {modules.map((mod) => (
          <ModuleTile
            key={mod.id}
            module={mod}
            value={scores[mod.id]}
            isSelected={selectedModuleId === mod.id}
            onPress={() => onSelectModule(mod.id)}
            disabled={disabled}
            mode={alliance}
            alignEnd={!isRed}
          />
        ))}

        {/* Fouls tile */}
        <ModuleTile
          module={
            {
              id: FOULS_MODULE_ID,
              label: "Fouls",
              type: "boolean",
            } as ModuleConfig
          }
          value={null}
          isSelected={selectedModuleId === FOULS_MODULE_ID}
          onPress={() => onSelectModule(FOULS_MODULE_ID)}
          disabled={disabled}
          mode={alliance}
          foulData={{ minor: minorCount, major: majorCount }}
          alignEnd={!isRed}
        />
      </ScrollView>
    </View>
  );
});
