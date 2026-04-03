import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { SelectorModule } from "../../scoring/SelectorModule";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
  isSolo?: boolean;
}

export function SelectorFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance = "blue",
  isSolo = false,
}: Props) {
  return (
    <View className="flex-1 px-3">
      <SelectorModule
        module={module as any}
        value={(value as string) ?? null}
        onChange={(v: string | null) => onChange(v)}
        disabled={disabled}
        variant={isSolo ? "compact" : "default"}
        alliance={alliance}
        isSolo={isSolo}
      />
    </View>
  );
}

export default SelectorFooter;
