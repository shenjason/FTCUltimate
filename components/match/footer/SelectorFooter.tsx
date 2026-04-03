import React from "react";
import { View, Text } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { BounceButton } from "../../ui/AnimatedPressable";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
}

export default function SelectorFooter({
  module,
  value,
  onChange,
  disabled = false,
}: Props) {
  const mod = module as import("../../../types/season").SelectorModule;
  const defaultValue = mod.defaultValue ?? null;
  const effectiveValue = (value as string | null) ?? defaultValue;

  return (
    <View className="flex-1 flex-row items-center justify-around gap-2">
      {mod.options.map((opt) => {
        const isActive = effectiveValue === opt.id;
        return (
          <BounceButton
            key={opt.id}
            onPress={() => {
              if ((value as string | null) === opt.id) {
                onChange(defaultValue);
              } else {
                onChange(opt.id);
              }
            }}
            disabled={disabled}
            className={`flex-1 h-16 rounded-xl flex-col items-center justify-center gap-1 active:scale-95 ${
              isActive
                ? "bg-secondary border-2 border-white/20 shadow-lg"
                : "bg-surface-container-highest/40 border border-outline-variant/10"
            }`}
          >
            <Text
              className={`text-[8px] font-black uppercase leading-none text-center tracking-tight ${isActive ? "text-on-secondary" : "text-on-surface-variant"}`}
            >
              {opt.label}
            </Text>
            {opt.points != null && (
              <Text
                className={`text-[7px] ${isActive ? "text-on-secondary opacity-80" : "text-on-surface-variant opacity-70"}`}
              >
                ({opt.points}pts)
              </Text>
            )}
          </BounceButton>
        );
      })}
    </View>
  );
}
