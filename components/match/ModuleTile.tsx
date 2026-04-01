import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { ModuleConfig } from "../../types/season";
import type { ScoreValue } from "../../types/match";
import { MaterialIcon } from "../ui/MaterialIcon";

// Maps module label keywords to Material Symbols icon names
function iconForModule(module: ModuleConfig): string {
  // JSON-defined icon takes priority over keyword lookup
  if (module.icon) return module.icon;

  const label = module.label.toLowerCase();
  if (label.includes("sample")) return "category";
  if (label.includes("specimen")) return "precision_manufacturing";
  if (label.includes("park") || label.includes("climb") || label.includes("hang"))
    return "rocket_launch";
  if (label.includes("foul")) return "warning";
  if (label.includes("grid")) return "grid_view";
  if (label.includes("tier") || label.includes("layer")) return "layers";
  if (module.type === "boolean") return "check";
  if (module.type === "multi_boolean") return "check_box";
  if (module.type === "selector") return "list";
  return "category";
}

function formatValue(module: ModuleConfig, score: ScoreValue): string {
  switch (module.type) {
    case "boolean":
      return score === true ? "Yes" : "No";
    case "counter":
      return String((score as number) ?? 0);
    case "tiered_counter": {
      const tiers = score as Record<string, number>;
      if (!tiers) return "0";
      return String(Object.values(tiers).reduce((a, b) => a + b, 0));
    }
    case "selector": {
      // If no explicit value, try defaultValue
      const effectiveScore = score ?? module.defaultValue ?? null;
      if (!effectiveScore) return "—";
      // Find the option label for the selected id
      const opt = module.options.find(o => o.id === effectiveScore);
      return opt ? opt.label : String(effectiveScore);
    }
    case "multi_boolean": {
      const items = score as Record<string, boolean>;
      if (!items) return "0";
      return String(Object.values(items).filter(Boolean).length);
    }
    case "grid": {
      const cells = score as Record<string, boolean>;
      if (!cells) return "0";
      return String(Object.values(cells).filter(Boolean).length);
    }
    default:
      return "—";
  }
}

interface FoulData {
  minor: number;
  major: number;
}

interface ModuleTileProps {
  module: ModuleConfig;
  value: ScoreValue;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** "solo" = white active state, "red"/"blue" = alliance color active state */
  mode?: "solo" | "red" | "blue";
  foulData?: FoulData;
  alignEnd?: boolean;
}

export function ModuleTile({
  module,
  value,
  isSelected,
  onPress,
  disabled = false,
  mode = "solo",
  foulData,
  alignEnd = false,
}: ModuleTileProps) {
  const icon = iconForModule(module);
  const displayValue = formatValue(module, value);

  // Selected background/text styling per mode
  let selectedBg: string;
  let selectedTextColor: string;
  let selectedIconColor: string;
  if (mode === "red") {
    selectedBg = "bg-error";
    selectedTextColor = "text-on-error";
    selectedIconColor = "#490013";
  } else if (mode === "blue") {
    selectedBg = "bg-primary";
    selectedTextColor = "text-on-primary";
    selectedIconColor = "#002d64";
  } else {
    // solo: white
    selectedBg = "bg-on-surface";
    selectedTextColor = "text-surface";
    selectedIconColor = "#0a0e16";
  }

  const containerCls = isSelected
    ? `${selectedBg} border border-white/20`
    : "bg-surface-container-highest/50 border border-outline-variant/10";

  const labelCls = isSelected
    ? `text-[8px] uppercase font-bold ${selectedTextColor} opacity-80`
    : "text-[8px] uppercase font-bold text-on-surface-variant";

  const valueCls = isSelected
    ? `font-bold text-2xl leading-none ${selectedTextColor}`
    : "font-bold text-2xl leading-none text-on-surface";

  const iconColor = isSelected ? selectedIconColor : "#a8abb6";
  const alignCls = alignEnd ? "items-end" : "items-start";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ width: "47%" }}
      className={`p-2.5 rounded-lg active:scale-95 ${containerCls} ${alignCls}`}
    >
      <View className={`flex-row items-center gap-1.5 mb-1 ${alignEnd ? "flex-row-reverse" : ""}`}>
        <MaterialIcon name={icon} size={14} color={iconColor} />
        <Text className={labelCls}>{module.label}</Text>
      </View>
      {foulData ? (
        <View className={`flex-row gap-3 ${alignEnd ? "flex-row-reverse" : ""}`}>
          <View className={alignEnd ? "items-end" : "items-start"}>
            <Text className="text-[7px] uppercase font-bold text-secondary leading-none">
              Min
            </Text>
            <Text className="text-sm font-bold text-secondary leading-none">
              {foulData.minor}
            </Text>
          </View>
          <View className={`${alignEnd ? "border-r pr-2 items-end" : "border-l pl-2 items-start"} border-outline-variant/30`}>
            <Text className="text-[7px] uppercase font-bold text-error leading-none">
              Maj
            </Text>
            <Text className="text-sm font-bold text-error leading-none">
              {foulData.major}
            </Text>
          </View>
        </View>
      ) : (
        <Text className={valueCls}>{displayValue}</Text>
      )}
    </TouchableOpacity>
  );
}

export { iconForModule, formatValue };
