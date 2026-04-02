import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue, ScoreMap } from "../../types/match";
import { useMatchStore } from "../../lib/store";
import { VerticalDial } from "../ui/VerticalDial";

interface FoulCounts {
  redMinor: number;
  redMajor: number;
  blueMinor: number;
  blueMajor: number;
}

interface FullMatchFooterProps {
  selectedModule: ModuleConfig | null;
  isFoulsSelected: boolean;
  redScores: ScoreMap;
  blueScores: ScoreMap;
  fouls: FoulCounts;
  onRedChange: (val: ScoreValue) => void;
  onBlueChange: (val: ScoreValue) => void;
  disabled: boolean;
}

function CounterZone({
  alliance,
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  alliance: "red" | "blue";
  label: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const isRed = alliance === "red";
  const incrementBg = isRed ? "bg-stitch-error" : "bg-stitch-primary";
  const labelColor = isRed ? "text-stitch-error" : "text-stitch-primary";
  const displayLabel = `${isRed ? "Red" : "Blue"} ${label}`;

  const decrement = () => onChange(Math.max(value - step, min));
  const increment = () =>
    onChange(max !== undefined ? Math.min(value + step, max) : value + step);

  // Red: + on far left, dial center, − inward (right)
  // Blue: − inward (left), dial center, + on far right
  return (
    <View
      className={`flex-1 flex-row items-center px-3 ${
        isRed ? "bg-[#1a0808] border-r border-white/5" : "bg-[#080818]"
      }`}
    >
      {isRed ? (
        <>
          {/* Red: + button (far left) */}
          <TouchableOpacity
            onPress={increment}
            disabled={disabled || (max !== undefined && value >= max)}
            className={`w-14 h-14 rounded-full items-center justify-center active:opacity-70 ${incrementBg}`}
          >
            <Text className="text-on-stitch-error text-3xl leading-none font-bold">+</Text>
          </TouchableOpacity>

          {/* Scroll-drum dial with count inside */}
          <View className="flex-1 items-center justify-center">
            <Text
              className={`text-[9px] uppercase font-bold tracking-[0.15em] ${labelColor} mb-1`}
            >
              {displayLabel}
            </Text>
            <VerticalDial
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={onChange}
              disabled={disabled}
              height={90}
              width={80}
            />
          </View>

          {/* − button (inward / right) */}
          <TouchableOpacity
            onPress={decrement}
            disabled={disabled || value <= min}
            className="w-14 h-14 rounded-full bg-surface-container-highest items-center justify-center active:opacity-70"
          >
            <Text className="text-on-surface text-3xl leading-none font-bold">−</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Blue: − button (inward / left) */}
          <TouchableOpacity
            onPress={decrement}
            disabled={disabled || value <= min}
            className="w-14 h-14 rounded-full bg-surface-container-highest items-center justify-center active:opacity-70"
          >
            <Text className="text-on-surface text-3xl leading-none font-bold">−</Text>
          </TouchableOpacity>

          {/* Scroll-drum dial with count inside */}
          <View className="flex-1 items-center justify-center">
            <Text
              className={`text-[9px] uppercase font-bold tracking-[0.15em] ${labelColor} mb-1`}
            >
              {displayLabel}
            </Text>
            <VerticalDial
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={onChange}
              disabled={disabled}
              height={90}
              width={80}
            />
          </View>

          {/* Blue: + button (far right) */}
          <TouchableOpacity
            onPress={increment}
            disabled={disabled || (max !== undefined && value >= max)}
            className={`w-14 h-14 rounded-full items-center justify-center active:opacity-70 ${incrementBg}`}
          >
            <Text className="text-on-stitch-primary text-3xl leading-none font-bold">+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function FoulsZone({
  alliance,
  fouls,
  disabled,
}: {
  alliance: "red" | "blue";
  fouls: FoulCounts;
  disabled: boolean;
}) {
  const { incrementFoul, decrementFoul } = useMatchStore();
  const isRed = alliance === "red";
  const majorCount = isRed ? fouls.redMajor : fouls.blueMajor;
  const minorCount = isRed ? fouls.redMinor : fouls.blueMinor;
  const labelColor = isRed ? "text-stitch-error" : "text-stitch-primary";
  const displayLabel = isRed ? "Red: Fouls" : "Blue: Fouls";

  return (
    <View
      className={`flex-1 flex-col justify-center px-4 ${
        isRed ? "bg-[#1a0808] border-r border-white/5" : "bg-[#080818]"
      }`}
    >
      <Text
        className={`text-[9px] uppercase font-bold tracking-[0.2em] ${labelColor} mb-2 ${
          isRed ? "" : "text-right"
        }`}
      >
        {displayLabel}
      </Text>
      <View className="flex-row gap-3">
        {/* Minor foul */}
        <View className="flex-1 items-center gap-1">
          <Text className="text-[8px] uppercase font-bold text-stitch-secondary">
            Minor
          </Text>
          <Text className="text-xl font-black text-stitch-secondary">
            {minorCount}
          </Text>
          <View className="flex-row gap-1">
            <TouchableOpacity
              onPress={() => decrementFoul(alliance, "minor")}
              disabled={disabled || minorCount <= 0}
              className="flex-1 bg-surface-container-highest rounded-lg py-1 items-center"
            >
              <Text className="text-on-surface text-sm">−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => incrementFoul(alliance, "minor")}
              disabled={disabled}
              className="flex-[2] bg-stitch-secondary rounded-lg py-1 items-center"
            >
              <Text className="text-on-stitch-error text-sm">+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Major foul */}
        <View className="flex-1 items-center gap-1">
          <Text className="text-[8px] uppercase font-bold text-stitch-error">
            Major
          </Text>
          <Text className="text-xl font-black text-stitch-error">
            {majorCount}
          </Text>
          <View className="flex-row gap-1">
            <TouchableOpacity
              onPress={() => decrementFoul(alliance, "major")}
              disabled={disabled || majorCount <= 0}
              className="flex-1 bg-surface-container-highest rounded-lg py-1 items-center"
            >
              <Text className="text-on-surface text-sm">−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => incrementFoul(alliance, "major")}
              disabled={disabled}
              className="flex-[2] bg-stitch-error rounded-lg py-1 items-center"
            >
              <Text className="text-on-stitch-error text-sm">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export function FullMatchFooter({
  selectedModule,
  isFoulsSelected,
  redScores,
  blueScores,
  fouls,
  onRedChange,
  onBlueChange,
  disabled,
}: FullMatchFooterProps) {
  if (isFoulsSelected) {
    return (
      <View className="h-36 flex-row border-t border-outline-variant/10">
        <FoulsZone alliance="red" fouls={fouls} disabled={disabled} />
        <FoulsZone alliance="blue" fouls={fouls} disabled={disabled} />
      </View>
    );
  }

  if (!selectedModule) {
    return (
      <View className="h-36 flex-row border-t border-outline-variant/10 items-center justify-center">
        <Text className="text-on-surface-variant text-sm">
          Select a module above
        </Text>
      </View>
    );
  }

  if (selectedModule.type === "counter") {
    const mod = selectedModule as ModuleConfig & {
      min?: number;
      max?: number;
      step?: number;
    };
    const min = mod.min ?? 0;
    const max = mod.max;
    const step = mod.step ?? 1;

    return (
      <View className="h-36 flex-row border-t border-outline-variant/10">
        <CounterZone
          alliance="red"
          label={selectedModule.label}
          value={(redScores[selectedModule.id] as number) ?? 0}
          min={min}
          max={max}
          step={step}
          onChange={(v) => onRedChange(v)}
          disabled={disabled}
        />
        <CounterZone
          alliance="blue"
          label={selectedModule.label}
          value={(blueScores[selectedModule.id] as number) ?? 0}
          min={min}
          max={max}
          step={step}
          onChange={(v) => onBlueChange(v)}
          disabled={disabled}
        />
      </View>
    );
  }

  // Fallback for non-counter module types
  return (
    <View className="h-36 flex-row border-t border-outline-variant/10">
      <View className="flex-1 bg-[#1a0808] flex-col justify-center px-4 border-r border-white/5">
        <Text
          numberOfLines={1}
          className="text-[9px] uppercase font-bold text-stitch-error mb-2"
        >
          Red: {selectedModule.label}
        </Text>
        <FallbackControls
          module={selectedModule}
          value={redScores[selectedModule.id]}
          onChange={onRedChange}
          disabled={disabled}
        />
      </View>
      <View className="flex-1 bg-[#080818] flex-col justify-center px-4">
        <Text
          numberOfLines={1}
          className="text-[9px] uppercase font-bold text-stitch-primary mb-2"
        >
          Blue: {selectedModule.label}
        </Text>
        <FallbackControls
          module={selectedModule}
          value={blueScores[selectedModule.id]}
          onChange={onBlueChange}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

function FallbackControls({
  module,
  value,
  onChange,
  disabled,
}: {
  module: ModuleConfig;
  value: ScoreValue;
  onChange: (v: ScoreValue) => void;
  disabled: boolean;
}) {
  switch (module.type) {
    case "boolean":
      return (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onChange(true)}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg ${value === true ? "bg-stitch-primary" : "bg-surface-container-highest"}`}
          >
            <Text className="text-on-surface font-semibold">Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChange(false)}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg ${value !== true ? "bg-stitch-primary" : "bg-surface-container-highest"}`}
          >
            <Text className="text-on-surface font-semibold">No</Text>
          </TouchableOpacity>
        </View>
      );
    case "selector": {
      const mod = module as import('../../types/season').SelectorModule;
      const defaultValue = mod.defaultValue ?? null;
      const effectiveValue = (value as string | null) ?? defaultValue;
      return (
        <View className="flex-row flex-wrap gap-2 justify-center">
          {mod.options.map((opt) => {
            const isActive = effectiveValue === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() =>
                  onChange((value as string | null) === opt.id ? defaultValue : opt.id)
                }
                disabled={disabled}
                className={`px-3 py-2 rounded-lg ${isActive ? "bg-stitch-primary" : "bg-surface-container-highest"}`}
              >
                <Text className="text-on-surface text-sm font-semibold">
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
    default:
      return (
        <Text className="text-on-surface-variant text-sm italic">
          {module.type}
        </Text>
      );
  }
}
