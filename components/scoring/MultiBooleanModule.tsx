// components/scoring/MultiBooleanModule.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { MultiBooleanModule as MultiBooleanConfig } from "../../types/season";
import { ModuleCard } from "../ui/ModuleCard";

interface Props {
  module: MultiBooleanConfig;
  value: Record<string, boolean>;
  onChange: (v: Record<string, boolean>) => void;
  disabled: boolean;
  variant?: "default" | "compact";
  alliance?: "red" | "blue";
}

export function MultiBooleanModule({
  module,
  value,
  onChange,
  disabled,
  variant,
  alliance,
}: Props) {
  const vals = value ?? {};
  const isCompact = variant === "compact";

  const toggle = (itemId: string) => {
    if (disabled) return;
    onChange({ ...vals, [itemId]: !vals[itemId] });
  };

  if (isCompact) {
    return (
      <ModuleCard
        label={module.label}
        disabled={disabled}
        variant="compact"
        alliance={alliance}
      >
        {module.items.map((item) => {
          const active = vals[item.id] === true;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggle(item.id)}
              disabled={disabled}
              className={`flex-row items-center justify-between w-full rounded-lg py-1.5 px-2 mb-1 border ${
                active
                  ? "bg-stitch-primary border-stitch-primary"
                  : "bg-surface-dim border-outline-variant"
              }`}
            >
              <Text
                className={`text-[10px] font-medium flex-1 ${active ? "text-white" : "text-on-surface-variant"}`}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text
                className={`text-[10px] ml-1 ${active ? "text-stitch-primary" : "text-on-surface-variant"}`}
              >
                +{item.points}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ModuleCard>
    );
  }

  return (
    <ModuleCard
      label={module.label}
      description={module.description}
      disabled={disabled}
    >
      {module.items.map((item) => {
        const active = vals[item.id] === true;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggle(item.id)}
            disabled={disabled}
            className={`flex-row items-center justify-between w-full rounded-xl py-3 px-3 mb-2 border ${
              active
                ? "bg-stitch-primary border-stitch-primary"
                : "bg-surface-dim border-outline-variant"
            }`}
          >
            <Text
              className={`text-sm font-medium ${active ? "text-white" : "text-on-surface-variant"}`}
            >
              {item.label}
            </Text>
            <Text
              className={`text-xs ${active ? "text-stitch-primary" : "text-on-surface-variant"}`}
            >
              +{item.points}pts
            </Text>
          </TouchableOpacity>
        );
      })}
    </ModuleCard>
  );
}
