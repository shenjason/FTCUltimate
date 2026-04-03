import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { GridModule } from "../../scoring/GridModule";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
  isSolo?: boolean;
}

export function GridFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance = "blue",
  isSolo = false,
}: Props) {
  return (
    <View className="flex-1 px-3">
      <GridModule
        module={module as any}
        value={(value as any) ?? {}}
        bonusValues={{}}
        onChange={(v: Record<string, boolean>) => onChange(v)}
        onBonusChange={() => {}}
        disabled={disabled}
        variant={isSolo ? "compact" : "default"}
        alliance={alliance}
        isSolo={isSolo}
      />
    </View>
  );
}

export default GridFooter;
