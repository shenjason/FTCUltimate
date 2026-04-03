// components/scoring/BooleanModule.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import type { BooleanModule as BooleanModuleConfig } from "../../types/season";
import { ModuleCard } from "../ui/ModuleCard";

interface Props {
  module: BooleanModuleConfig;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
  variant?: "default" | "compact";
  alliance?: "red" | "blue";
}

export function BooleanModule({
  module,
  value,
  onChange,
  disabled,
  variant,
  alliance,
}: Props) {
  const active = value === true;
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <ModuleCard
        label={module.label}
        disabled={disabled}
        variant="compact"
        alliance={alliance}
      >
        <TouchableOpacity
          onPress={() => !disabled && onChange(!active)}
          disabled={disabled}
          className={`w-full rounded-lg py-1.5 items-center justify-center border ${
            active
              ? "bg-stitch-primary border-stitch-primary"
              : "bg-surface-dim border-outline-variant"
          }`}
        >
          <Text
            className={`font-semibold text-xs ${active ? "text-white" : "text-on-surface-variant"}`}
          >
            {active ? `YES +${module.points}` : "NO"}
          </Text>
        </TouchableOpacity>
      </ModuleCard>
    );
  }

  return (
    <ModuleCard
      label={module.label}
      description={module.description}
      disabled={disabled}
    >
      <TouchableOpacity
        onPress={() => !disabled && onChange(!active)}
        disabled={disabled}
        className={`w-full rounded-xl py-3 items-center justify-center border ${
          active
            ? "bg-stitch-primary border-stitch-primary"
            : "bg-surface-dim border-outline-variant"
        }`}
      >
        <Text
          className={`font-semibold text-base ${active ? "text-white" : "text-on-surface-variant"}`}
        >
          {active ? `YES  +${module.points}pts` : "NO"}
        </Text>
      </TouchableOpacity>
    </ModuleCard>
  );
}
