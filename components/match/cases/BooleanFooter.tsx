import React from "react";
import { View } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { BooleanModule } from "../../scoring/BooleanModule";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
  isSolo?: boolean;
}

export function BooleanFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance = "blue",
  isSolo = false,
}: Props) {
  // BooleanModule expects a BooleanModule config; cast the module appropriately
  return (
    <View className="flex-1 flex-row items-center px-4 gap-2">
      <BooleanModule
        module={module as any}
        value={Boolean(value)}
        onChange={(v: boolean) => onChange(v)}
        disabled={disabled}
        variant={isSolo ? "compact" : "default"}
        alliance={alliance}
        isSolo={isSolo}
      />
    </View>
  );
}

export default BooleanFooter;
