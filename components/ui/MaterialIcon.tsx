import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Maps Material Symbols / Stitch icon names to MaterialCommunityIcons names
const ICON_MAP: Record<string, string> = {
  // Actions
  pause: "pause",
  play_arrow: "play",
  restart_alt: "restart",
  menu: "menu",
  close: "close",
  remove: "minus",
  add: "plus",
  check: "check",
  // Navigation
  north: "arrow-up",
  double_arrow: "chevron-double-up",
  // Objects
  category: "tag",
  precision_manufacturing: "robot-industrial",
  rocket_launch: "rocket-launch-outline",
  warning: "alert",
  block: "cancel",
  timer: "timer-outline",
  upload_file: "upload",
  // Scoring
  grid_view: "grid",
  layers: "layers",
  check_box: "checkbox-multiple-outline",
  list: "format-list-bulleted",
  // Phase indicators
  auto_awesome: "lightning-bolt",
  sports_score: "flag-checkered",
};

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function MaterialIcon({ name, size = 20, color }: MaterialIconProps) {
  const iconName = (ICON_MAP[name] ?? name) as React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
}
