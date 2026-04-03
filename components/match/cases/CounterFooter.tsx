import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { CounterModule } from "../../scoring/CounterModule";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
  isSolo?: boolean;
}

export function CounterFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance = "blue",
  isSolo = false,
}: Props) {
  return (
    <View className="flex-1 flex-row items-center">
      <CounterModule
        module={module as any}
        value={(value as number) ?? 0}
        onChange={(v: number) => onChange(v)}
        disabled={disabled}
        variant={isSolo ? "compact" : "default"}
        alliance={alliance}
        isSolo={isSolo}
      />
    </View>
  );
}

export default CounterFooter;
