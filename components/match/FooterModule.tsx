import React from "react";
import { View, Text } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";
import { BounceButton } from "../ui/AnimatedPressable";
import { MaterialIcon } from "../ui/MaterialIcon";
import { VerticalDial } from "../ui/VerticalDial";
import THEME from "../../lib/theme";

interface FooterModuleProps {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled?: boolean;
  alliance?: "red" | "blue";
  matchType?: "solo" | "full";
}

export function FooterModule({
  module,
  value,
  onChange,
  disabled = false,
  alliance = "blue",
  matchType = "full",
}: FooterModuleProps) {
  const accentBg = alliance === "blue" ? "bg-primary" : "bg-error";
  const accentText = alliance === "blue" ? "text-on-primary" : "text-on-error";

  switch (module.type) {
    case "boolean":
      return (
        <View className="flex-1 flex-row gap-3 h-full items-center">
          <BounceButton
            onPress={() => onChange(true)}
            disabled={disabled}
            className={`flex-1 h-16 rounded-xl items-center justify-center ${
              value === true
                ? `${accentBg} shadow-lg`
                : "bg-surface-container-highest/40 border border-outline-variant/10"
            }`}
          >
            <MaterialIcon
              name="check"
              size={20}
              color={
                value === true
                  ? alliance === "blue"
                    ? THEME.colors.blueIcon
                    : THEME.colors.redIcon
                  : THEME.colors.mutedIcon
              }
            />
            <Text
              className={`text-[8px] font-black uppercase mt-1 tracking-tight ${
                value === true ? accentText : "text-on-surface-variant"
              }`}
            >
              Yes
            </Text>
          </BounceButton>
          <BounceButton
            onPress={() => onChange(false)}
            disabled={disabled}
            className={`flex-1 h-16 rounded-xl items-center justify-center ${
              value !== true
                ? `${accentBg} shadow-lg`
                : "bg-surface-container-highest/40 border border-outline-variant/10"
            }`}
          >
            <MaterialIcon
              name="close"
              size={20}
              color={
                value !== true
                  ? alliance === "blue"
                    ? THEME.colors.blueIcon
                    : THEME.colors.redIcon
                  : THEME.colors.mutedIcon
              }
            />
            <Text
              className={`text-[8px] font-black uppercase mt-1 tracking-tight ${
                value !== true ? accentText : "text-on-surface-variant"
              }`}
            >
              No
            </Text>
          </BounceButton>
        </View>
      );

    case "counter": {
      const count = (value as number) ?? 0;
      const min = (module as any).min ?? 0;
      const max = (module as any).max;
      const step = (module as any).step ?? 1;

      const decrement = () => onChange(Math.max(count - step, min));
      const increment = () =>
        onChange(
          max !== undefined ? Math.min(count + step, max) : count + step,
        );

      const isRed = alliance === "red";

      return (
        <View
          className={`flex-1 flex-row items-center px-3 ${
            isRed
              ? THEME.classes.footerRedBg + " border-r border-white/5"
              : THEME.classes.footerBlueBg
          }`}
        >
          {isRed ? (
            <>
              <BounceButton
                onPress={increment}
                disabled={disabled || (max !== undefined && count >= max)}
                className={`w-14 h-14 rounded-full items-center justify-center active:opacity-70 ${accentBg}`}
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
                disabled={disabled || count <= min}
                className="w-14 h-14 rounded-full bg-surface-container-highest items-center justify-center active:opacity-70"
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
                disabled={disabled || count <= min}
                className="w-14 h-14 rounded-full bg-surface-container-highest items-center justify-center active:opacity-70"
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
                disabled={disabled || (max !== undefined && count >= max)}
                className={`w-14 h-14 rounded-full items-center justify-center active:opacity-70 ${accentBg}`}
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

    case "selector": {
      const mod = module as import("../../types/season").SelectorModule;
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

    case "tiered_counter": {
      const tierValues = (value as Record<string, number>) ?? {};
      return (
        <View className="flex-1 flex-row gap-3">
          {(module as any).tiers.map((tier: any) => {
            const tierCount = tierValues[tier.id] ?? 0;
            return (
              <View key={tier.id} className="flex-1 items-center gap-1">
                <Text className="text-[8px] uppercase font-bold text-on-surface-variant">
                  {tier.label}
                </Text>
                <View className="flex-row gap-1.5 h-12 w-full">
                  <BounceButton
                    onPress={() =>
                      onChange({
                        ...tierValues,
                        [tier.id]: Math.max(0, tierCount - 1),
                      })
                    }
                    disabled={disabled || tierCount <= 0}
                    className="flex-1 bg-surface-container-highest rounded-xl items-center justify-center"
                  >
                    <MaterialIcon
                      name="remove"
                      size={18}
                      color={THEME.colors.brightIcon}
                    />
                  </BounceButton>
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-xl font-black text-on-surface">
                      {tierCount}
                    </Text>
                  </View>
                  <BounceButton
                    onPress={() =>
                      onChange({ ...tierValues, [tier.id]: tierCount + 1 })
                    }
                    disabled={disabled}
                    className={`flex-1 ${accentBg} rounded-xl items-center justify-center`}
                  >
                    <MaterialIcon
                      name="add"
                      size={18}
                      color={
                        alliance === "blue"
                          ? THEME.colors.blueIcon
                          : THEME.colors.redIcon
                      }
                    />
                  </BounceButton>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    case "multi_boolean": {
      const itemValues = (value as Record<string, boolean>) ?? {};
      return (
        <View className="flex-1 flex-row flex-wrap gap-2 items-center justify-center">
          {(module as any).items.map((item: any) => (
            <BounceButton
              key={item.id}
              onPress={() =>
                onChange({ ...itemValues, [item.id]: !itemValues[item.id] })
              }
              disabled={disabled}
              className={`px-3 py-2 h-14 rounded-xl items-center justify-center ${
                itemValues[item.id]
                  ? `${accentBg} border-2 border-white/20`
                  : "bg-surface-container-highest/40 border border-outline-variant/10"
              }`}
            >
              <Text
                className={`text-[8px] font-black uppercase ${itemValues[item.id] ? accentText : "text-on-surface-variant"}`}
              >
                {item.label}
              </Text>
            </BounceButton>
          ))}
        </View>
      );
    }

    case "grid": {
      const cellValues = (value as Record<string, boolean>) ?? {};
      return (
        <View className="flex-1 flex-col gap-1 items-center justify-center">
          {Array.from({ length: (module as any).rows }).map((_, row) => (
            <View key={row} className="flex-row gap-1">
              {Array.from({ length: (module as any).cols }).map((_, col) => {
                const cellId = `${row}_${col}`;
                return (
                  <BounceButton
                    key={cellId}
                    onPress={() =>
                      onChange({ ...cellValues, [cellId]: !cellValues[cellId] })
                    }
                    disabled={disabled}
                    className={`w-9 h-9 rounded-lg ${cellValues[cellId] ? accentBg : "bg-surface-container-highest/40 border border-outline-variant/10"}`}
                  >
                    <View />
                  </BounceButton>
                );
              })}
            </View>
          ))}
        </View>
      );
    }

    case "calculated":
      return (
        <Text className="text-on-surface-variant text-sm italic">
          Auto-calculated
        </Text>
      );

    default:
      return null;
  }
}

export default FooterModule;
