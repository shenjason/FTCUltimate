// components/ui/ModuleCard.tsx
import React from "react";
import { View, Text } from "react-native";
import THEME from "../../lib/theme";

interface ModuleCardProps {
  label: string;
  description?: string;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "default" | "compact";
  alliance?: "red" | "blue";
}

export function ModuleCard({
  label,
  description,
  disabled,
  children,
  variant = "default",
  alliance,
}: ModuleCardProps) {
  const isCompact = variant === "compact";

  // Alliance tinting is intentionally scoped to the card container (border + background) only.
  // Interactive elements (buttons, etc.) inside modules are NOT tinted — this was not requested
  // and would conflict with their fixed blue/neutral color semantics.
  const borderColor = isCompact
    ? alliance === "blue"
      ? THEME.colors.moduleCompactBlueBorder
      : alliance === "red"
        ? THEME.colors.moduleCompactRedBorder
        : THEME.colors.border
    : THEME.colors.border;

  const bgColor = isCompact
    ? alliance === "blue"
      ? THEME.colors.moduleCompactBlueBg
      : alliance === "red"
        ? THEME.colors.moduleCompactRedBg
        : THEME.colors.moduleBg
    : THEME.colors.moduleBg;

  return (
    <View
      style={{ borderColor, backgroundColor: bgColor }}
      className={`border ${isCompact ? "rounded-xl p-2 mb-2" : "rounded-2xl p-4 mb-3"} ${disabled ? "opacity-40" : ""}`}
    >
      <Text
        className={`text-text-primary font-semibold ${isCompact ? "text-xs mb-1" : "text-base mb-1"}`}
      >
        {label}
      </Text>
      {!isCompact && description ? (
        <Text className="text-text-secondary text-xs mb-2">{description}</Text>
      ) : null}
      {children}
    </View>
  );
}
