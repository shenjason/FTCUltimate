import React from "react";
import { View, Text } from "react-native";
import type { ModuleConfig } from "../../../types/season";
import type { ScoreValue } from "../../../types/match";
import { BounceButton } from "../../ui/AnimatedPressable";
import { VerticalDial } from "../../ui/VerticalDial";
import THEME from "../../../lib/theme";

interface Props {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
}

export default function CounterFooter({
  module,
  value,
  onChange,
  disabled = false,
  alliance,
}: Props) {
  const count = (value as number) ?? 0;
  const min = (module as any).min ?? 0;
  const max = (module as any).max;
  const step = (module as any).step ?? 1;

  const decrement = () => onChange(Math.max(count - step, min));
  const increment = () =>
    onChange(max !== undefined ? Math.min(count + step, max) : count + step);

  const decDisabled = disabled || count <= min;
  const incDisabled = disabled || (max !== undefined && count >= max);

  const isRed = alliance === "red";
  const isNeutral = alliance == null;

  const containerClass = isNeutral
    ? "flex-1 flex-row items-center px-3 bg-surface-container-highest/40"
    : `flex-1 flex-row items-center px-3 ${isRed ? THEME.classes.footerRedBg + " border-r border-white/5" : THEME.classes.footerBlueBg}`;

  const accentBg =
    alliance === "blue"
      ? "bg-primary"
      : alliance === "red"
        ? "bg-error"
        : "bg-surface-container-highest/40";

  return (
    <View className={containerClass}>
      {isRed ? (
        <>
          <BounceButton
            onPress={increment}
            disabled={incDisabled}
            className={`w-14 h-14 rounded-full items-center justify-center active:opacity-70 ${accentBg} ${incDisabled ? "opacity-40" : ""}`}
          >
            <Text className="text-on-stitch-error text-3xl leading-none font-bold">
              +
            </Text>
          </BounceButton>

          <View className="flex-1 items-center justify-center">
            <Text
              className={`text-[9px] uppercase font-bold tracking-[0.15em] ${isRed ? "text-stitch-error" : "text-stitch-primary"} mb-1`}
            >
              {`${isRed ? "Red" : "Blue"} ${module.label}`}
            </Text>
            <VerticalDial
              value={count}
              min={min}
              max={max}
              step={step}
              onChange={(v) => onChange(v)}
              disabled={disabled}
              height={110}
              width={160}
            />
          </View>

          <BounceButton
            onPress={decrement}
            disabled={decDisabled}
            className={`w-14 h-14 rounded-full bg-surface-container-highest items-center justify-center active:opacity-70 ${decDisabled ? "opacity-40" : ""}`}
          >
            <Text className="text-on-surface text-3xl leading-none font-bold">
              −
            </Text>
          </BounceButton>
        </>
      ) : (
        <>
          <BounceButton
            onPress={decrement}
            disabled={decDisabled}
            className={`w-14 h-14 rounded-full bg-surface-container-highest items-center justify-center active:opacity-70 ${decDisabled ? "opacity-40" : ""}`}
          >
            <Text className="text-on-surface text-3xl leading-none font-bold">
              −
            </Text>
          </BounceButton>

          <View className="flex-1 items-center justify-center">
            <Text
              className={`text-[9px] uppercase font-bold tracking-[0.15em] ${isRed ? "text-stitch-error" : "text-stitch-primary"} mb-1`}
            >
              {`${isRed ? "Red" : "Blue"} ${module.label}`}
            </Text>
            <VerticalDial
              value={count}
              min={min}
              max={max}
              step={step}
              onChange={(v) => onChange(v)}
              disabled={disabled}
              height={110}
              width={160}
            />
          </View>

          <BounceButton
            onPress={increment}
            disabled={incDisabled}
            className={`w-14 h-14 rounded-full items-center justify-center active:opacity-70 ${accentBg} ${incDisabled ? "opacity-40" : ""}`}
          >
            <Text className="text-on-stitch-primary text-3xl leading-none font-bold">
              +
            </Text>
          </BounceButton>
        </>
      )}
    </View>
  );
}
