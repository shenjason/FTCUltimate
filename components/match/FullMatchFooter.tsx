import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue, ScoreMap } from "../../types/match";
import { useMatchStore } from "../../lib/store";

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
  const displayLabel = `${isRed ? "Red" : "Blue"}: ${label}`;

  const decrement = () => onChange(Math.max(value - step, min));
  const increment = () =>
    onChange(max !== undefined ? Math.min(value + step, max) : value + step);

  return (
    <View
      className={`flex-1 flex-col justify-center px-6 ${
        isRed ? "bg-[#1a0808] border-r border-white/5" : "bg-[#080818]"
      }`}
    >
      <View
        className={`flex-row items-center justify-between mb-2 ${
          isRed ? "" : "flex-row-reverse"
        }`}
      >
        <Text
          className={`text-[9px] uppercase font-bold tracking-[0.2em] ${labelColor}`}
        >
          {displayLabel}
        </Text>
        <Text className="text-3xl font-black text-on-surface">
          {String(value).padStart(2, "0")}
        </Text>
      </View>
      <View
        className={`flex-row gap-4 h-14 ${isRed ? "" : "flex-row-reverse"}`}
      >
        <TouchableOpacity
          onPress={decrement}
          disabled={disabled || value <= min}
          className="flex-1 bg-surface-container-highest rounded-xl items-center justify-center active:opacity-70"
        >
          <Text className="text-on-surface text-3xl leading-none">−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={increment}
          disabled={disabled || (max !== undefined && value >= max)}
          className={`flex-[2] ${incrementBg} rounded-xl items-center justify-center active:opacity-70`}
        >
          <Text
            className={`text-3xl leading-none ${
              isRed ? "text-on-stitch-error" : "text-on-stitch-primary"
            }`}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
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
      <View className="flex-1 bg-[#1a0808] items-center justify-center border-r border-white/5">
        <Text className="text-[9px] uppercase font-bold text-stitch-error mb-2">
          Red: {selectedModule.label}
        </Text>
        <FallbackControls
          module={selectedModule}
          value={redScores[selectedModule.id]}
          onChange={onRedChange}
          disabled={disabled}
        />
      </View>
      <View className="flex-1 bg-[#080818] items-center justify-center">
        <Text className="text-[9px] uppercase font-bold text-stitch-primary mb-2">
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
      const mod = module as ModuleConfig & { options: { id: string; label: string }[] };
      return (
        <View className="flex-row flex-wrap gap-2 justify-center">
          {mod.options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => onChange(value === opt.id ? null : opt.id)}
              disabled={disabled}
              className={`px-3 py-2 rounded-lg ${value === opt.id ? "bg-stitch-primary" : "bg-surface-container-highest"}`}
            >
              <Text className="text-on-surface text-sm font-semibold">
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
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
