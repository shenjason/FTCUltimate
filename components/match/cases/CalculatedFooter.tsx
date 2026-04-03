import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { CalculatedModule } from "../../scoring/CalculatedModule";

interface Props {
  module: ModuleConfig;
  computedValue: number;
  disabled?: boolean;
  alliance?: "red" | "blue";
  isSolo?: boolean;
}

export function CalculatedFooter({
  module,
  computedValue,
  disabled = false,
  alliance = "blue",
  isSolo = false,
}: Props) {
  return (
    <View className="flex-1 px-3">
      <CalculatedModule
        module={module as any}
        computedValue={computedValue}
        disabled={disabled}
        variant={isSolo ? "compact" : "default"}
        alliance={alliance}
        isSolo={isSolo}
      />
    </View>
  );
}

export default CalculatedFooter;
