import React from "react";
import { View, Text } from "react-native";
import THEME from "../../lib/theme";
import type { MatchPhase } from "../../types/match";
import { FlipTimeDisplay } from "../timer/FlipDigit";

interface GlassTimerProps {
  displayTime: string;
  phase: MatchPhase;
  isPaused: boolean;
  /** "solo": wider/taller fills the right panel; "full": compact center column */
  variant?: "solo" | "full";
}

function phaseLabel(phase: MatchPhase, isPaused: boolean): string {
  if (isPaused) return "PAUSED";
  if (phase === "auto" || phase === "pre_auto") return "AUTO";
  if (phase === "transition") return "TRANSITION";
  if (phase === "teleop" || phase === "pre_teleop") return "TELEOP";
  if (phase === "complete") return "FINAL";
  return "";
}

export function GlassTimer({
  displayTime,
  phase,
  isPaused,
  variant = "full",
}: GlassTimerProps) {
  const isSolo = variant === "solo";

  return (
    <View
      className={`border border-outline-variant/10 items-center shadow-2xl ${
        isSolo ? "rounded-2xl px-6 py-5 w-full" : "rounded-xl px-8 py-4"
      }`}
      style={{ backgroundColor: THEME.colors.gradientOverlay }}
    >
      {displayTime ? (
        <FlipTimeDisplay
          displayTime={displayTime}
          fontSize={isSolo ? 48 : 48}
          color={THEME.colors.brightIcon}
        />
      ) : (
        <Text
          className={`font-bold tracking-tight text-on-surface ${
            isSolo ? "text-5xl" : "text-5xl"
          }`}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          —
        </Text>
      )}
      <Text
        className={`uppercase font-bold mt-2 ${
          isSolo
            ? "text-[10px] tracking-[0.4em] text-tertiary opacity-90"
            : "text-[8px] tracking-widest text-tertiary"
        }`}
      >
        {phaseLabel(phase, isPaused)}
      </Text>
    </View>
  );
}
